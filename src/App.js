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
import IntroSection from './components/loadproject/IntroSection';


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

    componentDidMount() {
        this.getStorageUsed()
    }

    transitionToEditor(newSharedState) {
        this.setState({ 
            sharedState: newSharedState,
            phase: "editor"
        })
    }

    transitionToMenu() {
        if (this.state.sharedState) {
            if (this.state.sharedState.getStateIsDirty() && !window.confirm('Are you sure you want to go back to the menu? You will lose your unsaved changes.')) {
                return // user wants to stay on this page
            }

            this.state.sharedState.finishCondition()
        }
        this.setState({
            sharedState: undefined,
            phase: "loadproject"
        })
    }

    getStorageUsed() {
        navigator.storage.estimate().then(estimate => {
            this.setState({ storageUsed: (estimate.usage / estimate.quota * 100).toPrecision(2) })
        });
    }

    render() {
        switch(this.state.phase) {
            case "loadproject":
                return (
                    <>
                        <IntroSection />
                        <LoadProject transitionToEditor={this.transitionToEditor} autoload={39} />
                        {this.state.storageUsed && <footer>Storage used: {this.state.storageUsed}%</footer>}
                    </>
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