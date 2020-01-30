import { Text } from 'slate';
import Logger from './logging'

export default class SharedState {
    constructor(params) {      
        this.logger = new Logger(Logger.getNewId(), params)
        
        this.node_id_counter = 0;
        this.map = {};

        // this.editor_ref and this.graphPane set in the editor and graphpane
        this.editor_ref = undefined;
        this.graphPane = undefined;

        window.setInterval((() => this.logger.logEvent({'type': 'document_content', 'content': this.getEditor().getValue()})), 30000) // log entire document content every 30 seconds
    }

    getEditor() {
        return this.editor_ref.current;
    }

    getNodeId() {
        this.node_id_counter++;
        return this.node_id_counter;
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
        if (this.map[id] === undefined) {
            console.log(this.map + " id " + id);
        }
        
        if (this.map[id].doc_nodes === undefined) {
            this.map[id].doc_nodes = {};
        }
        this.map[id].doc_nodes[long_or_short] = doc_node;
    }

    getGraphNodeAndDocNode(id) {
        return this.map[id];
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
        if (map) {
            return map.doc_link_node[long_or_short].current;
        }
    }

    getAllDocNodeRefs(id) {
        var docNodes = [];
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            ["long", "short", "section"].forEach(long_or_short => {
                if (map.doc_link_node[long_or_short]) {
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

    updateDocShortText(id, newText) {
        var docNode = this.getDocNodeShortText(id);
        
        if (docNode) {
            var editor = this.getEditor();

            // replace any text with newText
            docNode.nodes.forEach(child => {
                editor.removeNodeByKey(child.key);
            });
            editor.insertNodeByKey(docNode.key, 0, Text.create({text: newText}));
        }
    }

    updateGraphShortText(id, newText) {
        var graphNode = this.getGraphNode(id);
        
        if (graphNode) {
            graphNode.updateShortText(newText);            
        }
    }
}