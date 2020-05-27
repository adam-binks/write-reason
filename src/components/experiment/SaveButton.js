import React, { Component } from 'react';
import './ExperimentalControls.css';

export default class ExperimentControls extends Component {
    render() {
        return (
            <div className="experiment-controls">
                <button className='pure-button' onClick={this.props.backToMenu}>Back</button>
                <button className='pure-button' onClick={this.props.showExperimentInfo}>Study participant info</button>
                <button className='pure-button' onClick={this.props.sharedState.exportPDF}>Export PDF</button>
                <button className='pure-button' onClick={this.props.sharedState.downloadExperimentData}>Export logs</button>
                <button className='pure-button button-primary' onClick={this.props.sharedState.save}>Save</button>
            </div>
        );
    }
}