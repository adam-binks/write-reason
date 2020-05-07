import React from 'react';
import { Text } from 'slate';
import Html from 'slate-html-serializer'
import Logger from './logging'

export default class SharedState {
    constructor(params) {      
        this.logger = new Logger(Logger.getNewId(), params)
        this.condition = params.condition;
        this.params = params;
        
        this.node_id_counter = 0;
        this.map = {};
        this.map_recycle_bin = {};

        // this.editor_ref and this.graphPane set in the editor and graphpane
        this.editor_ref = undefined;
        this.graphPane = undefined;

        // log entire document content every 30 seconds
        this.intervalLogger = window.setInterval(() => {
            this.logger.logEvent({'type': 'document_content_detailed', 'content': this.getEditor().getValue()});
            this.logger.logEvent({'type': 'document_content_markdown', 'content': this.getArgumentMarkdown()});
        }, 30000);
        
        this.downloadExperimentData = this.downloadExperimentData.bind(this);
    }

    downloadExperimentData() {
        const element = document.createElement("a");
        const data = {
            params: this.params,
            argument: this.getArgumentMarkdown(),
            logs: this.logger.getExperimentData()
        }
        const file = new Blob([JSON.stringify(data, null, 2)], {type: 'text/plain'});

        element.href = URL.createObjectURL(file);
        element.download = this.logger.getExperimentId() + ".json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    getArgumentMarkdown() {
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
                                return undefined;
                        }
                    }
                } 
            }
        ]

        const serializer = new Html({rules: RULES})
        var output = serializer.serialize(this.getEditor().value)
        
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
        return output
    }

    finishCondition() {
        this.downloadExperimentData();

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