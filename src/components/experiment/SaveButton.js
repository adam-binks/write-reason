import React, { Component } from 'react';
import './ExperimentalControls.css';

export default class ExperimentControls extends Component {
    render() {
        if (this.props.sharedState.params.logExplore) {
            return (
                <div className="experiment-controls">
                    <button className='pure-button button-primary' onClick={this.props.backToMenu}>Back</button>
                </div>
            );
        }
    }
}