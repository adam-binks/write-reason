import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import NodePlugin from './NodePlugin.js';
import GraphPlugin from './GraphPlugin.js';
import LoggingPlugin from './LoggingPlugin.js';
import ReorderPlugin from './ReorderPlugin.js';

const plugins = {
    'graph': [
        GraphPlugin(),
        NodePlugin(),
        ReorderPlugin(),
        LoggingPlugin(),
    ],
    'plain': [
        LoggingPlugin(),
    ]
};

const schema = {
    blocks: {
        section: {
            // isVoid: true,
            // nodes: [

            // ]
        }
    }
}

const initialValue = Value.fromJSON({
    document: {
        nodes: [
            {
                object: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        object: 'text',
                        text: '',
                    },
                    // {
                    //     object: 'inline',
                    //     type: 'link',
                    //     data: {node_id: 'sometghing'},
                    //     nodes: [
                    //         {
                    //             object: 'text',
                    //             text: 'This is a link.'
                    //         }
                    //     ]
                    // }
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
        },
        getValue: () => {
            return this.state.value;
        }
    }

    onChange = ({ value }) => {
        this.setState({ value })
    }

    render() {
        const plainClass = this.props.sharedState.condition === "plain" ? " slate-editor-no-graph" : "";

        return <Editor
            className={"slate-editor" + plainClass}
            ref={this.props.sharedState.editor_ref}
            schema={schema}
            plugins={plugins[this.props.sharedState.condition]}
            queries={this.queries}
            value={this.state.value}
            onChange={this.onChange}
            placeholder="Write your document here..."
        />
    }
}

export default DocEditor;