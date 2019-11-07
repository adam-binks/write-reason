import React from 'react';
import './App.css';
import DocPane from './components/DocPane.js';
import GraphPane from './components/GraphPane.js';
// import Divider from './components/Divider';
import SplitPane from 'react-split-pane';

function App() {
    return (
        <div className="App">
            <SplitPane split="vertical" defaultSize="50%">
                <DocPane />
                <GraphPane />
            </SplitPane>
        </div>
    );
}

export default App;
