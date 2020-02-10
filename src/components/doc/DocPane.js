import React, { Component } from 'react';
import './DocPane.css';
import DocEditor from './DocEditor.js'

class DocPane extends Component {
    render() {
        return (
            <div className="pane doc">
                <DocEditor sharedState={this.props.sharedState} />
            </div>
        );
    }
}

export default DocPane;