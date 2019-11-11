import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import NodePlugin from './NodePlugin.js';

const plugins = [
    NodePlugin()
];

const initialValue = Value.fromJSON({
    document: {
        nodes: [
            {
                object: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        object: 'text',
                        text: 'A line of text in a paragraph.',
                    },
                    {
                        object: 'inline',
                        type: 'link',
                        nodes: [
                            {
                                object: 'text',
                                text: 'This is a link.'
                            }
                        ]
                    }
                ],
            },
        ],
    },
});

class DocEditor extends React.Component {
    state = {
        value: initialValue,
    }

    onChange = ({ value }) => {
        this.setState({ value })
    }

    render() {
        return <Editor
            plugins = {plugins}
            value={this.state.value}
            onChange={this.onChange}
        />
    }
}

export default DocEditor;