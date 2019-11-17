import React from 'react';
import LinkNode from './LinkNode.js'

export default function LinkPlugin(options) {
    return {
        commands: {
            wrapLinkAtSelection(editor, node_id) {
                return editor.wrapInline({
                    type: "link",
                    data: { "node_id": node_id }
                });
            }
        },

        renderInline(props, editor, next) {
            if (props.node.type === 'link') {                
                return <LinkNode {...props} sharedState={editor.getSharedState()} />
            }

            return next();
        },

        onDrop(event, editor, next) {
            console.log('drop');
            next();
        }
    }
}