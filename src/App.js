import React, { Component } from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';
import SharedState from './shared_state.js';
import ConditionForm from './components/experiment/ConditionForm.js';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phase: "setup",
            sharedState: undefined
        }
    }

    render() {
        if (this.state.phase === "setup") {
            return (
                <ConditionForm submitFunc={(sharedStateParams) => this.setState({'phase': 'editor', 'sharedState': new SharedState(sharedStateParams)}) }/>
            )
        } else {
            return (
                <div className="App">
                    <SplitPane split="vertical" defaultSize="50%">
                        <DocPane sharedState={this.state.sharedState} />
                        <GraphPane sharedState={this.state.sharedState} />
                    </SplitPane>
                </div>
            );
        }
    }
}