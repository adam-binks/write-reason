import React from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';

class SharedState {
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
        this.map[id] = {graph: graph_node};
    }

    setLinkMapping(id, doc_node) {
        this.map[id].doc_node = doc_node;
    }

    getGraphNodeAndDocNode(id) {
        return this.map(id)
    }
}

function App() {
    var sharedState = new SharedState();
    return (
        <div className="App">
            <SplitPane split="vertical" defaultSize="50%">
                <DocPane sharedState={sharedState} />
                <GraphPane sharedState={sharedState} />
            </SplitPane>
        </div>
    );
}

export default App;
