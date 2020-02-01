import React, { Component } from 'react';
import Countdown, { zeroPad } from 'react-countdown-now';
import './ExperimentalControls.css';

const countdownRenderer = ({ hours, minutes, seconds, completed }) => {
    // if (completed) {
    //     // Render a completed state
    //     return <Completionist />;
    // } else {
        var lowTime = minutes < 1 ? " low-time" : "";
        return <span className={"countdown" + lowTime}>{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    // }
  };


export default class ExperimentControls extends Component {
    render() {
        return (
            <div className="experiment-controls">
                <Countdown date={Date.now() + this.props.sharedState.params.duration} renderer={countdownRenderer} />
                <button onClick={this.props.sharedState.downloadExperimentData}>Download experiment data</button>
                <button onClick={this.props.completeFunc}>Complete condition</button>
            </div>
        );
    }
}