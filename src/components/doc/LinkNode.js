import React from 'react';

export default function LinkNode(props) {
    return (
        <p className="node-link" {...props.attributes}>
            {props.children}
        </p>
    );
}