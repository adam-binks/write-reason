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
        const sharedState = this.props.sharedState
        sharedState.getSavedDocValue((savedValue) => {
            this.setState({
                value: savedValue ? Value.fromJSON(savedValue) : emptyValue
            }, sharedState.editorHasLoaded)
        })
    }

    state = {
        value: undefined, // don't display editor until the db's saved document loads
        mapHasLoaded: false, // force a refresh of the component once the sharedState.map has loaded so section refs are hooked up to graph nodes
    }
    
    queries = {
        getSharedState: () => {
            return this.props.sharedState;
        },
        getValue: () => {
            return this.state.value;
        },
        mapHasLoaded: () => {
            this.setState({ mapHasLoaded: true })
        }
    }

    onChange = ({ value }) => {
        this.setState({ value })
    }

    render() {
        const plainClass = this.props.sharedState.condition === "plain" ? " slate-editor-no-graph" : ""

        if (this.state.value !== undefined) {
            return <Editor
                className={"slate-editor" + plainClass}
                key={this.state.mapHasLoaded ? "map-loading" : "map-loaded"}
                ref={this.props.sharedState.editor_ref}
                schema={schema}
                plugins={plugins[this.props.sharedState.condition]}
                queries={this.queries}
                value={this.state.value}
                onChange={this.onChange}
                placeholder="Write your document here..."
                spellCheck={true}
            />
        } else {
            return <p></p>
        }
    }
}

export default DocEditor;