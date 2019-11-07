import React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'

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
                ],
            },
        ],
    },
})

class DocEditor extends React.Component {
    state = {
        value: initialValue,
    }

    onChange = ({ value }) => {
        this.setState({ value })
    }

    render() {
        return <Editor value={this.state.value} onChange={this.onChange} />
    }
}

export default DocEditor;