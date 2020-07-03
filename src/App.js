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
import ExperimentInfo from './components/experiment/ExperimentInfo';
import IntroSection from './components/loadproject/IntroSection';
import Modal from 'react-modal'
import { isMobile } from "react-device-detect";

Modal.setAppElement('#root')
const modalStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      maxWidth              : '40%',
      maxHeight             : '90%',
      padding               : '50px'
    }
  }

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
        if(window.location.search) {
            const urlParams = new URLSearchParams(window.location.search)
            const scenario = urlParams.get('scenario')

            if (scenario !== 'biohacking' && scenario !== 'sharedSpace') {
                console.error('Unrecognised scenario ' + scenario)
            } else {
                localStorage.setItem('scenario', scenario)
                console.log(localStorage.getItem('scenario'))
            }
        }

        this.getStorageUsed()
    }

    transitionToEditor(newSharedState) {
        this.setState({ 
            sharedState: newSharedState,
            phase: "editor"
        })

        // open the instructions modal on first load
        if (!localStorage.getItem('hasLoadedBefore')) {
            localStorage.setItem('hasLoadedBefore', true)
            this.setState({ modalIsOpen: true })
        }
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
            var storageUsed = estimate.usage / estimate.quota * 100
            if (storageUsed < 0.00000005) {
                storageUsed = 0 // prevent 10e-16 sort of thing
            }
            storageUsed = storageUsed.toPrecision(2)

            this.setState({ storageUsed })
        });
    }

    render() {
        if (isMobile) {
            return (
                <p>Write Reason is designed for non-mobile devices. Please access from a laptop or desktop computer.</p>
            )
        }

        switch(this.state.phase) {
            case "loadproject":
                return (
                    <>
                        <IntroSection />
                        <LoadProject transitionToEditor={this.transitionToEditor} autoload={false} />
                        {this.state.storageUsed && <footer>Storage used: {this.state.storageUsed}%</footer>}
                    </>
                )
            case "editor":
                return (
                    <div className="App">
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            style={modalStyles}
                            contentLabel="Experiment information"
                            onRequestClose={() => this.setState({ modalIsOpen: false })}
                        >
                            <ExperimentInfo />
                            <button className="pure-button" onClick={() => this.setState({ modalIsOpen: false })}>Close</button>
                        </Modal>

                        <DndProvider backend={Backend}>
                            <SplitPane split="vertical" defaultSize="50%">
                                <DocPane sharedState={this.state.sharedState} />
                                <GraphPane sharedState={this.state.sharedState} />
                            </SplitPane>
                            <SaveButton 
                                sharedState={this.state.sharedState}
                                backToMenu={this.transitionToMenu} 
                                showExperimentInfo={() => this.setState({ modalIsOpen: true })}
                            />
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