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
                var id = props.node.data.get("node_id");
                var ref = React.createRef();
                editor.getSharedState().registerLinkNode(id, ref);

                return <LinkNode ref={ref} {...props} sharedState={editor.getSharedState()} nodeId={id}/>
            }

            return next();
        },

        onDrop(event, editor, next) {
            console.log('drop');
            next();
        }
    }
}