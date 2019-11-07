import React, { Component } from 'react';
import DocEditor from './DocEditor.js'

class DocPane extends Component {
    render() {
        return (
            <div className="pane">
                <DocEditor />
            </div>
        );
    }
}

export default DocPane;