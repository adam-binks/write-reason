import React from 'react';
import PlainBlockNode from './nodes/PlainBlockNode.js'

export default function ReorderPlugin(options) {
    return {
        renderBlock(props, editor, next) {            
            if (!props.node.type || props.node.type === '' || props.node.type === 'paragraph') {
                return <PlainBlockNode {...props}/>
            }
            
            return next();
        },
    }
}