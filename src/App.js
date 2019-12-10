import React from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';
import SharedState from './shared_state.js';

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
