/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
import React, { Component } from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';
import SharedState from './shared_state.js';
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phase: "editor",
            sharedState: new SharedState({"condition": "graph"}),
            params: undefined
        }
    }

    render() {
        switch(this.state.phase) {
            case "editor":
                return (
                    <div className="App">
                        <DndProvider backend={Backend}>
                            <SplitPane split="vertical" defaultSize="50%">
                                <DocPane sharedState={this.state.sharedState} />
                                <GraphPane sharedState={this.state.sharedState} />
                            </SplitPane>
                        </DndProvider>
                    </div>
                );
            
            case "reset":
                // hacky way to destroy and recreate all components
                window.setTimeout(() => this.setState({phase: "editor"}), 0.1)
                return (
                    <p>...</p>
                )
        }
    }
}