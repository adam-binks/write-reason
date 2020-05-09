/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
import React, { Component } from 'react';
import './App.css';
import DocPane from './components/doc/DocPane.js';
import GraphPane from './components/graph/GraphPane.js';
import SplitPane from 'react-split-pane';
import LoadProject from './components/loadproject/LoadProject.js';
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SaveButton from './components/experiment/SaveButton';


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phase: "loadproject",
            params: undefined
        }

        this.transitionToEditor = this.transitionToEditor.bind(this)
        this.transitionToMenu = this.transitionToMenu.bind(this)
    }

    transitionToEditor(newSharedState) {
        this.setState({ 
            sharedState: newSharedState,
            phase: "editor"
        })
    }

    transitionToMenu() {
        if (this.state.sharedState) {
            this.state.sharedState.finishCondition()
        }
        this.setState({
            sharedState: undefined,
            phase: "loadproject"
        })
    }

    render() {
        switch(this.state.phase) {
            case "loadproject":
                return (
                    <LoadProject transitionToEditor={this.transitionToEditor} autoload={false} />
                )
            case "editor":
                return (
                    <div className="App">
                        <DndProvider backend={Backend}>
                            <SplitPane split="vertical" defaultSize="50%">
                                <DocPane sharedState={this.state.sharedState} />
                                <GraphPane sharedState={this.state.sharedState} />
                            </SplitPane>
                            <SaveButton sharedState={this.state.sharedState} backToMenu={this.transitionToMenu} />
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