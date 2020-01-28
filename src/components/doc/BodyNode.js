import React, { Component } from 'react';

export default class BodyNode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            externalHover: false
        }
        this.toggleHover = this.toggleHover.bind(this);
    }

    toggleHover() {
        var node = this.props.sharedState.getGraphNode(this.props.nodeId);
        if (node) {
            node.setHovered(!this.state.hover);
        }

        this.setState({hover: !this.state.hover});
    }
    
    setExternalHover(isHovered) {
        this.setState({externalHover: isHovered});
    }

    render() {
        var hoverClass = this.state.externalHover ? " hovered" : "";
        var classes = "node-body" + hoverClass;

        return (
            <p className={classes} {...this.props.attributes} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                {this.props.children}
            </p>
        );
    }
}