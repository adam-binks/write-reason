import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import NodePlugin from './NodePlugin.js';
import GraphPlugin from './GraphPlugin.js';

const plugins = [
    GraphPlugin(),
    NodePlugin()
];

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
        return <Editor
            className="slate-editor"
            ref={this.props.sharedState.editor_ref}
            schema={schema}
            plugins={plugins}
            queries={this.queries}
            value={this.state.value}
            onChange={this.onChange}
            placeholder="Write your document here..."
        />
    }
}

export default DocEditor;