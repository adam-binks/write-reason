import React from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import NodePlugin from './NodePlugin.js';
import GraphPlugin from './GraphPlugin.js';
import LoggingPlugin from './LoggingPlugin.js';
import ReorderPlugin from './ReorderPlugin.js';
import HoveringMenu from './HoveringMenu.js';
import { schema } from './Schema.js'

const plugins = {
    'graph': [
        LoggingPlugin(),
        GraphPlugin(),
        NodePlugin(),
        ReorderPlugin(),
    ],
    'plain': [
        LoggingPlugin(),
        HoveringMenu(),
    ]
};

const emptyValue = Value.fromJSON({
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

    componentDidMount() {
        this.props.sharedState.getSavedDocValue((savedValue) => {
            if (savedValue) {
                this.setState({ value: Value.fromJSON(savedValue) })
            }
        })
    }

    // don't display editor until the db's saved document loads
    state = {
        value: undefined
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
        console.log(value);
        
        this.setState({ value })
    }

    render() {
        const plainClass = this.props.sharedState.condition === "plain" ? " slate-editor-no-graph" : "";

        if (this.state.value) {
            return <Editor
                className={"slate-editor" + plainClass}
                ref={this.props.sharedState.editor_ref}
                schema={schema}
                plugins={plugins[this.props.sharedState.condition]}
                queries={this.queries}
                value={this.state.value}
                onChange={this.onChange}
                placeholder="Write your document here..."
                spellCheck={false}
            />
        } else {
            return <p></p>
        }
    }
}

export default DocEditor;