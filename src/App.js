/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
import React, { Component } from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';
import SharedState from './shared_state.js';
import ConditionForm from './components/experiment/ConditionForm.js';
import TeardownScreen from './components/experiment/TeardownScreen.js';
import ExperimentControls from './components/experiment/ExperimentControls.js'
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phase: "editor", // "setup", //
            sharedState: new SharedState({"condition": "graph"}), // undefined, //
            params: undefined,
            completedConditions: []
        }

        this.finishCondition = this.finishCondition.bind(this);
    }

    finishCondition() {
        this.state.sharedState.finishCondition();

        this.setState({ 
            completedConditions: this.state.completedConditions.concat([this.state.params.condition])
        }, () => {
            var other_condition = this.state.params.condition === "graph" ? "plain" : "graph";
            
            if (this.state.completedConditions.includes(other_condition)) {
                // both conditions have been tested
                this.setState({'phase': 'teardown'})
            } else {
                // still need to run other condition
                var updatedParams = this.state.params;
                updatedParams.condition = other_condition;

                this.setState({
                    'params': updatedParams, 
                    'sharedState': new SharedState(this.state.params)
                });
            }
        })
    }

    render() {
        switch(this.state.phase) {
            case "setup":
                return (
                    <ConditionForm submitFunc={(sharedStateParams) => this.setState({
                        'phase': 'editor',
                        'params': sharedStateParams,
                        'sharedState': new SharedState(sharedStateParams),
                    })}/>
                )

            case "editor":
                switch(this.state.sharedState.condition) {
                    case "graph":
                        return (
                            <div className="App">
                                <DndProvider backend={Backend}>
                                    <SplitPane split="vertical" defaultSize="50%">
                                        <DocPane key="graph" sharedState={this.state.sharedState} />
                                        <GraphPane sharedState={this.state.sharedState} />
                                    </SplitPane>
                                    <ExperimentControls sharedState={this.state.sharedState} completeFunc={this.finishCondition} />
                                </DndProvider>
                            </div>
                        );

                    case "plain":
                        return (
                            <div className="App">
                                <DocPane key="plain" sharedState={this.state.sharedState} />
                                <ExperimentControls sharedState={this.state.sharedState} completeFunc={this.finishCondition} />
                            </div>
                        );
                }

            case "teardown":
                return (
                    <TeardownScreen />
                )
        }
    }
}