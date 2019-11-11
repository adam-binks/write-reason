import React from 'react';
import LinkNode from './LinkNode.js'

export default function LinkPlugin(options) {
    return {
        renderInline(props, editor, next) {
            if (props.node.type === 'link') {
                return <LinkNode {...props} />
            }

            return next()
        },

        onDrop(event, editor, next) {
            console.log('drop');
            next();
        }
    }
}