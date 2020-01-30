import React, { Component } from 'react';

export default class ExperimentControls extends Component {
    constructor(props) {
        super(props);

        this.downloadTxtFile = this.downloadTxtFile.bind(this);
    }

    downloadTxtFile = () => {
        const element = document.createElement("a");
        const file = new Blob([this.props.sharedState.logger.getExperimentData()], {type: 'text/plain'});

        element.href = URL.createObjectURL(file);
        element.download = this.props.sharedState.logger.getExperimentId() + ".txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    render() {
        return (
            <div className="experiment-controls">
                <button onClick={this.downloadTxtFile}>Download experiment data</button>
            </div>
        );
    }
}