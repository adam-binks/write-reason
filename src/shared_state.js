import { Text } from 'slate';

export default class SharedState {
    node_id_counter = 0;
    map = {};
    // this.editor_ref and this.graphPane set in the editor and graphpane
    editor_ref = undefined;
    graphPane = undefined;

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
        if (this.map[id].doc_node === undefined) {
            this.map[id].doc_node = {};
        }
        this.map[id].doc_node[long_or_short] = doc_node;
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

    getDocNodes(id) {
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            return map.doc_node;
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

    getAllDocNodeRefs(id, long_or_short) {
        var docNodes = [];
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            ["long", "short"].forEach(long_or_short => {
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