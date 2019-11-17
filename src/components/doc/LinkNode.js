import React, { Component } from 'react';

class LinkNode extends Component {    
    render() {
        return (
            <p className="node-link" {...this.props.attributes}>
                {this.props.children}
            </p>
        );
    }
}

export default LinkNode;