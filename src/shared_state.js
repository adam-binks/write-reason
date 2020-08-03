import React from 'react';
import { Text } from 'slate';
import Html from 'slate-html-serializer'
import Logger from './logging'
import db from './db.js'
import { toast } from 'react-toastify';
import { pdf, Document, Page, Text as PdfText, StyleSheet, Font } from '@react-pdf/renderer';
import CrimsonText from './assets/CrimsonText-Regular.ttf'
import CrimsonTextBold from './assets/CrimsonText-Bold.ttf'


export default class SharedState {
    constructor(db_id, params) {
        if (!params.logExplore) {
            this.logger = new Logger(db_id, params)
        } else {
            this.logger = {logEvent: (x, y) => {} }
        }
        this.condition = params.condition;
        this.params = params;
        
        this.node_id_counter = 0;
        this.slate_id_counter = 10
        this.map = {};
        this.map_recycle_bin = {};
        this.db_id = db_id

        // this.editor_ref and this.graphPane set in the editor and graphpane
        this.editor_ref = undefined;
        this.graphPane = undefined;

        // log entire document content every 60 seconds
        if (!this.params.logExplore) {
            this.intervalLogger = window.setInterval(() => {
                this.logger.logEvent({'type': 'document_content_markdown', 'content': this.getArgumentMarkdown()});
            }, 60000);
        }
        
        this.downloadExperimentData = this.downloadExperimentData.bind(this);
        this.editorHasLoaded = this.editorHasLoaded.bind(this);
        this.save = this.save.bind(this)
        this.mapToJSON = this.mapToJSON.bind(this)
        this.exportPDF = this.exportPDF.bind(this)
        this.exploreNext = this.exploreNext.bind(this)
        this.explorePrev = this.explorePrev.bind(this)
        this.exploreLog = this.exploreLog.bind(this)

        // when the tab is closed, if the document has been edited, warn before closing
        window.onbeforeunload = (e) => {
            if (process.env.NODE_ENV !== 'development' && this.getStateIsDirty()) { // disable in development for webpack hot reloading
                e.preventDefault()
                e.returnValue = '' // for Chrome
            }
        }
    }

    viewFactSheet() {
        const scenario = localStorage.getItem('scenario')
        if (!scenario) {
            toast.error('Fact sheet not found. Please re-open Write Reason using the link in the email we sent you.')
            return
        }

        const factSheetURL = scenario + '_factsheet.pdf'
        window.open(factSheetURL, '_blank')  // open in new tab
    }

    // called by editor once the database saved value has been set as the document.value
    editorHasLoaded() {
        this.getProjectThen(project => {
            this.node_id_counter = project.node_id_counter ? project.node_id_counter : 0
            this.map = project.map ? this.mapFromJSON(project.map) : {}
            this.getEditor().mapHasLoaded()
            this.projectName = project.name
            document.title = this.projectName + " - Write Reason"
        })
        
        this.lastSavedDocumentState = this.getEditor().getValue().document // editor is definitely not dirty right now
    }

    save(cb=undefined, forceLog=false) {
        const changes = {
            map: this.mapToJSON(),
            node_id_counter: this.node_id_counter,
            doc_value: this.getEditor().getValue().toJSON(),
            graph_value: this.graphPane.toJSON(),
        }
        db.table('projects')
            .update(this.db_id, changes)
            .then((idExists) => {
                if (!idExists) {
                    const message = 'Save error: file with ID ' + this.db_id.toString() + ' does not exist!'
                    console.log(message)
                    toast.error(message)
                } else {
                    toast.info('Changes saved!')
                    this.lastSavedDocumentState = this.getEditor().getValue().document
                    this.logger.logSaveState(changes, forceLog)
                }
            }).catch(err => {
                toast.error('Save error: ' + err.toString())
            })
            
        this.logger.logEvent({'type': 'save'})

        if (cb) {
            cb()
        }
    }

    getStateIsDirty() {
        return this.logger.stateIsDirty || (
            this.getEditor() && this.getEditor().getValue() && this.getEditor().getValue().document !== this.lastSavedDocumentState
        ) 
    }

    explorePrev() {
        if (this.params.logExplore.saveIndex === 0) {
            return
        }
        
        this.exploreLog(this.params.logExplore.project, this.params.logExplore.saveIndex - 1)
    }

    exploreNext() {
        if (this.params.logExplore.saveIndex === this.params.logExplore.project.log.saves.length - 1) {
            return
        }

        this.exploreLog(this.params.logExplore.project, this.params.logExplore.saveIndex + 1)
    }

    exploreLog(project, saveIndex) {
        const params = { condition: 'graph', logExplore: {project: project, saveIndex: saveIndex}, transitionToEditor: this.params.transitionToEditor }
        const sharedState = new SharedState(-1, params)
        this.params.transitionToEditor(sharedState, true)
    }

    getProjectThen(cb) {
        if (this.params.logExplore) {
            const logExplore = this.params.logExplore
            cb(logExplore.project.log.saves[logExplore.saveIndex])
        } else {
            db.table('projects')
                .get(this.db_id)
                .then(project => {
                    cb(project)
                })
        }
    }

    getSavedDocValue = async function(onDataLoad) {
        this.getProjectThen(project => {
            onDataLoad(project.doc_value)
        })
    }

    getSavedGraph = async function(onDataLoad) {
        this.getProjectThen(project => {
            onDataLoad(project.graph_value)
        })
    }

    mapToJSON() {
        var mapJson = {}
        const document = this.getEditor().value.document
        for (const id in this.map) {
            let doc_nodes = {};
            ['section', 'long', 'short'].forEach(part => {
                const docNodeObjects = this.getDocNodes(id)
                if (docNodeObjects && docNodeObjects[part]) {
                    const path = document.getPath(docNodeObjects[part])
                    if (path) {
                        doc_nodes[part] = path.toArray()
                    }
                } 
            })

            mapJson[id] = {
                graph_node: this.getGraphNode(id) ? this.getGraphNode(id).id : undefined,
                doc_nodes: doc_nodes
            }
        }

        return mapJson
    }

    mapFromJSON(json) {
        this.map = {}
        for (const id in json) {
            if (json[id].graph_node) {
                const graphNode = this.graphPane.getNodeById(id)
                if (graphNode) {
                    this.addGraphMapping(id, graphNode)
                } else {
                    toast.error("Error when loading: could not find graph node with ID " + id)
                }
            }

            if (json[id].doc_nodes) {
                for (const part in json[id].doc_nodes) {
                    const path = json[id].doc_nodes[part]
                    
                    const document = this.getEditor().value.document
                    if (document.hasNode(path)) {
                        this.setLinkMapping(id, document.getNode(path), part)
                    } else {
                        console.log(document);
                        
                        toast.error("Error when loading: could not find " + part + " with ID " + id)
                    }
                }
            }
        }

        return this.map
    }

    downloadExperimentData() {
        // save first to log the latest document version
        this.save(() => {
            db.table('projects')
            .toArray(projects => {
                const data = {
                    timestamp: new Date(),
                    preTaskSubmission: localStorage.getItem('preTaskSubmission'),
                    projects: projects,
                }
                this.downloadJSON(data, 'Write Reason logs.json')
                
            }).catch(err => {
                toast.error("Error downloading logs: " + err)
            })
        }, true)
    }

    getArgumentHTML() {
        const parentStyleIs = (node, styleToCheck) => {
            const parent = this.getEditor().value.document.getParent(node.key)
            return parent && parent.data.get("nodeStyle") === styleToCheck
        }

        const RULES = [
            {
                serialize: (node, children) => {
                    if (["block", "inline"].includes(node.object)) {
                        switch(node.type) {
                            case 'paragraph':
                            case '':
                                return <p>{children}</p>

                            case 'heading':
                                return <h2>{children}</h2>
                            
                            case 'section':
                                return <div>{children}</div>
                            
                            case 'body':
                                if (parentStyleIs(node, "Heading only")) {
                                    return <p></p>
                                } else {
                                    return <p>{children}</p>
                                }

                            case 'link':
                                if (node.object === "inline") {
                                    return <span>{children}</span>
                                } else {
                                    if (parentStyleIs(node, "Body only")) {
                                        return <p></p>
                                    } else {
                                        return <h2>{children}</h2>
                                    }
                                }

                            default:
                                return undefined
                        }
                    } else if(node.object === 'string') {
                        return node.text
                    }
                } 
            }
        ]

        const serializer = new Html({rules: RULES})
        return serializer.serialize(this.getEditor().value)
    }

    downloadJSON(json, filename) {
        const file = new Blob([JSON.stringify(json, null, 2)], {type: 'text/plain'})
        this.downloadBlob(file, filename)
    }

    downloadBlob(blob, filename) {
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    exportPDF() {
        this.logger.getLog(log => {
            this.getReactPdfDocument().then(file => {      
                this.downloadBlob(file, this.projectName + ".pdf")
            })
        })
    }

    getReactPdfDocument() {
        const markdown = this.getArgumentMarkdown()

        Font.register({family: 'Crimson Text', fonts: [
            {src: CrimsonText},
            {src: CrimsonTextBold, fontWeight: 800}
        ]})

        const styles = StyleSheet.create({
            page: {
                padding: 80
            },
            text: {
                fontFamily: "Crimson Text",
                width: "100%",
                fontSize: "12pt",
                paddingBottom: 8,
            },
            heading: {
                fontFamily: "Crimson Text",
                textDecoration: "underline",
                fontWeight: 800,
                width: "100%",
                fontSize: "12pt"
            }
        })

        const document = (
            <Document>
                <Page style={styles.page}>
                    {markdown.split('\n').map(line => {                        
                        if (line.startsWith('##')) { // markdown heading
                            line = line.substring('##'.length)
                            return <PdfText style={styles.heading}>{line}</PdfText>
                        }

                        return <PdfText style={styles.text}>{line}</PdfText>
                        }
                    )}
                </Page>
            </Document>
        )
        return pdf(document).toBlob()
    }

    getArgumentMarkdown() {
        var output = this.getArgumentHTML()
        
        var tagReplacements = [
            {regex: /<p>\s*<\/p>/g},  // special rule for removing empty paragraphs without inserting a newline

            {regex: /<p>/g},
            {regex: /<\/p>/g, replace: "\n\n"},
            {regex: /<div>/g},
            {regex: /<\/div>/g},
            {regex: /<span>/g},
            {regex: /<\/span>/g},
            {regex: /<h2>/g, replace: "## "},
            {regex: /<\/h2>/g, replace: "\n"},
        ]
        tagReplacements.forEach((replacement) => {
            output = output.replace(replacement.regex, replacement.replace ? replacement.replace : "")
        })

        // unescape HTML entities, eg replace '&amp' with '&'
        var element = document.createElement("span")
        element.innerHTML = output
        output = element.innerText

        return output
    }

    finishCondition() {
        window.onbeforeunload = undefined // remove the warning about closing the tab
        window.clearInterval(this.intervalLogger)
    }

    getEditor() {
        return this.editor_ref.current;
    }

    getNodeId() {
        this.node_id_counter++;
        return this.node_id_counter;
    }

    canAddLinkAtSelection() {
        const value = this.getEditor().value;
        const is_in_linked_block = value.blocks.some(block => (block.type === 'link' || block.type === 'section' || block.type === 'body'));
        const is_in_linked_inline = value.inlines.some(inline => (inline.type === 'link'));
        return !is_in_linked_block && !is_in_linked_inline;
    }

    addLinkAtSelection(id, graph_node) {
        this.getEditor().wrapLinkAtSelection(id);
        this.addGraphMapping(id, graph_node);
    }

    addGraphMapping(id, graph_node) {
        graph_node.setIsOnGraph(true);
        this.map[id] = { graph_node: graph_node };
    }

    setLinkMapping(id, doc_node, long_or_short) {
        if (!this.map[id]) {
            // uh oh, this should exist
            this.map[id] = {}

            // maybe the mapping was deleted and re-added with ctrl-Z
            // if so, hopefully it's stored as recently deleted
            this.checkRecycleBinForGraphNode(id)
        }

        if (this.map[id].doc_nodes === undefined) {
            this.map[id].doc_nodes = {};
        }
        this.map[id].doc_nodes[long_or_short] = doc_node;
    }

    getGraphNodeAndDocNode(id) {
        return this.map[id];
    }

    checkRecycleBinForGraphNode(id) {
        if (!this.map[id]) {
            this.map[id] = {}
        }

        if (this.map[id].graph_node) {
            // no need to restore
            return;
        }

        const prev_version = this.map_recycle_bin[id]
        if (prev_version && prev_version.graph_node) {
            console.log('restored from recycle');
            
            this.addGraphMapping(id, prev_version.graph_node)
        }
    }

    getGraphNode(id) {
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            return map.graph_node;
        }
    }

    removeGraphNode(id) {
        if (this.getDocNodes(id)) {
            Object.values(this.getDocNodes(id)).forEach(node => {
                this.getEditor().removeGraphLink(node);
            })
            this.map[id] = undefined;
        }
    }

    removeDocNode(id) {
        var map = this.getGraphNodeAndDocNode(id)
        if (map) {
            if (map.graph_node) {
                map.graph_node.setIsOnGraph(false);
            }
            
            this.map_recycle_bin[id] = this.map[id]
            this.map[id] = undefined
        }
    }

    getDocNodes(id) {
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            return map.doc_nodes;
        }
    }

    getDocNodeShortText(id) {
        const docNode = this.getDocNodes(id);
        if (docNode) {
            return docNode.short;
        }
    }

    getDocNodeLongText(id) {
        const docNode = this.getDocNodes(id);
        if (docNode) {
            return docNode.long;
        }
    }

    getDocNodeRef(id, long_or_short) {
        const map = this.getGraphNodeAndDocNode(id);
        if (map && map.doc_link_node) {
            return map.doc_link_node[long_or_short].current;
        }
    }

    getAllDocNodeRefs(id) {
        var docNodes = [];
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            ["long", "short", "section"].forEach(long_or_short => {
                if (map.doc_link_node && map.doc_link_node[long_or_short]) {
                    docNodes.push(map.doc_link_node[long_or_short].current)
                }
            })
        }
        return docNodes;
    }

    registerLinkNode(id, ref, long_or_short) {
        if (this.map[id].doc_link_node === undefined) {
            this.map[id].doc_link_node = {};
        }
        this.map[id].doc_link_node[long_or_short] = ref;
    }

    // check whether a graph node's doc node still exists
    updateIsOnGraphStatus(id) {
        var docNode = this.getDocNodeShortText(id);
        if (!docNode) {
            return false
        }

        if (docNode && !this.getEditor().value.document.hasNode(docNode.key)) {
            // tell the graph node that there is no doc node any more, for whatever reason
            this.removeDocNode(id)
            return false
        }

        return true
    }

    updateDocShortText(id, newText) {
        var docNode = this.getDocNodeShortText(id);
        
        if (docNode) {
            var editor = this.getEditor();

            if (this.updateIsOnGraphStatus(id)) {
                // replace any text with newText
                docNode.nodes.forEach(child => {
                    editor.removeNodeByKey(child.key);
                });
                editor.insertNodeByKey(docNode.key, 0, Text.create({text: newText}));
            }
        }
    }

    updateGraphShortText(id, newText) {
        var graphNode = this.getGraphNode(id);
        
        if (graphNode) {
            graphNode.updateShortText(newText);            
        }
    }

    updateGraphLongText(id, newText) {
        var graphNode = this.getGraphNode(id);
        
        if (graphNode) {
            graphNode.updateLongText(newText);            
        }
    }
}