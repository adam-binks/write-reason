import React, { Component } from 'react';
import './DocPane.css';
import DocEditor from './DocEditor.js'
import ExperimentControls from '../experiment/ExperimentControls.js'

class DocPane extends Component {
    render() {
        return (
            <div className="pane">
                <ExperimentControls sharedState={this.props.sharedState} />
                <DocEditor sharedState={this.props.sharedState} />
            </div>
        );
    }
}

export default DocPane;