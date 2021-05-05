import React, { Component } from 'react';
import './ExperimentalControls.css';

export default class SlideOutPane extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false
        }
    }

    render() {
        const addClosed = (cn) => {
            return cn + (this.state.open ? "" : " closed")
        }
        return (
            <>
                <button className={addClosed("pure-button timeline-toggle-button")} onClick={() => {
                    this.setState({open: !this.state.open})
                    const graph = document.getElementById('graph')
                    graph.classList.remove('timeline-explore-mode')
                }}>
                    {this.state.open ? "Hide timeline" : "Show timeline"}
                </button>
                <div className={addClosed("slide-out-pane")}>
                    {this.props.children}
                </div>
            </>
        )
    }
}