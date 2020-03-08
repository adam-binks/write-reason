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
        const buttonText = this.props.sharedState.params.sandboxMode ? "Exit sandbox mode" : "Submit argument";
        const countdown = <Countdown date={Date.now() + (this.props.sharedState.params.sandboxMode ? 3 * 1000 * 60 : this.props.sharedState.params.duration)} renderer={countdownRenderer} />
        return (
            <div className="experiment-controls">
                {countdown}
                {/* <button onClick={() => console.log(this.props.sharedState.getArgumentMarkdown())}>Log argument</button>
                <button onClick={this.props.sharedState.downloadExperimentData}>Download experiment data</button> */}
                <button tabIndex="-1" onClick={() => {
                    const msg = this.props.sharedState.params.sandboxMode ? "Please confirm with the researcher before continuing" : 'Please confirm with the researcher before continuing'
                    if (window.confirm(msg)) this.props.completeFunc()
                }}>{buttonText}</button>
            </div>
        );
    }
}