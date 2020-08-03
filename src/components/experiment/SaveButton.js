import React, { Component } from 'react';
import './ExperimentalControls.css';

export default class ExperimentControls extends Component {
    render() {
        if (this.props.sharedState.params.logExplore) {
            return (
                <div className="experiment-controls">
                    <button className='pure-button' onClick={this.props.backToMenu}>Back</button>
                    <button className='pure-button' onClick={this.props.sharedState.explorePrev}>←</button>
                    <button className='pure-button'>{this.props.sharedState.params.logExplore.project.filename + " " + this.props.sharedState.params.logExplore.saveIndex}</button>
                    <button className='pure-button' onClick={this.props.sharedState.exploreNext}>→</button>
                </div>
            );
        } else {
            return (
                <div className="experiment-controls">
                    <button className='pure-button' onClick={this.props.backToMenu}>Back</button>
                    <button className='pure-button' onClick={this.props.showExperimentInfo}>Study participant instructions</button>
                    <button className='pure-button' onClick={this.props.sharedState.viewFactSheet}>View fact sheet</button>
                    <button className='pure-button' onClick={this.props.sharedState.exportPDF}>Export PDF</button>
                    <button className='pure-button' onClick={this.props.sharedState.downloadExperimentData}>Export logs</button>
                    <button className='pure-button button-primary' onClick={() => {this.props.sharedState.save()}}>Save</button>
                </div>
            );
        }
    }
}