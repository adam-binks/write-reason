import React, { Component } from 'react';
import './ExperimentalControls.css';

export default class ExperimentControls extends Component {
    render() {
        return (
            <div className="experiment-controls">
                <button onClick={this.props.sharedState.save}>Save</button>
            </div>
        );
    }
}