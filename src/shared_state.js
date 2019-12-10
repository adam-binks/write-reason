
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
        this.map[id] = { graph_node: graph_node };
    }

    setLinkMapping(id, doc_node) {
        this.map[id].doc_node = doc_node;
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

    getDocNode(id) {
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            return map.doc_node;
        }
    }

    getDocNodeRef(id) {
        const map = this.getGraphNodeAndDocNode(id);
        if (map) {
            return map.doc_link_node.current;
        }
    }

    registerLinkNode(id, ref) {
        this.map[id].doc_link_node = ref;
    }

    updateDocShortText(id, newText) {
        var docNode = this.getDocNode(id);
        if (docNode) {
            //todo
        }
    }
}