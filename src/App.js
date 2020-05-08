/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
import React, { Component } from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';
import SharedState from './shared_state.js';
import LoadFile from './components/loadfile/LoadFile.js';
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phase: "loadfile",
            // sharedState: new SharedState({"condition": "graph"}),
            params: undefined
        }

        this.transitionToEditor = this.transitionToEditor.bind(this)
    }

    transitionToEditor(newSharedState) {
        this.setState({ 
            sharedState: newSharedState,
            phase: "editor"
        })
    }

    render() {
        switch(this.state.phase) {
            case "loadfile":
                return (
                    <LoadFile transitionToEditor={this.transitionToEditor}/>
                )
            case "editor":
                return (
                    <div className="App">
                        <DndProvider backend={Backend}>
                            <SplitPane split="vertical" defaultSize="50%">
                                <DocPane sharedState={this.state.sharedState} />
                                <GraphPane sharedState={this.state.sharedState} />
                            </SplitPane>
                        </DndProvider>
                        <ToastContainer
                            position="bottom-center"
                            autoClose={5000}
                            hideProgressBar
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable={false}
                            pauseOnHover
                        />
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