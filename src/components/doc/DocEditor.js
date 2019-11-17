import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import NodePlugin from './NodePlugin.js';
import GraphPlugin from './GraphPlugin.js';

const plugins = [
    GraphPlugin(),
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
    constructor(props) {
        super(props);

        this.props.sharedState.editor_ref = React.createRef();
    }

    state = {
        value: initialValue,
    }
    
    queries = {
        getSharedState: () => {
            return this.props.sharedState;
        }
    }

    onChange = ({ value }) => {
        this.setState({ value })
    }

    render() {
        return <Editor ref={this.props.sharedState.editor_ref}
            plugins={plugins}
            queries={this.queries}
            value={this.state.value}
            onChange={this.onChange}
        />
    }
}

export default DocEditor;