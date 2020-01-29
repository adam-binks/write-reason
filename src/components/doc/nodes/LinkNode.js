import React, { Component } from 'react';

class LinkNode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            externalHover: false,
            style: props.linkStyle
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
        var classes = "node-link" + hoverClass;

        if (this.state.style === "heading") {
            return (
                <p className={classes} {...this.props.attributes} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                    <u><b>{this.props.children}</b></u>
                </p>
            );

        } else if (this.state.style === "inline") {
            return (
                <p className={classes} {...this.props.attributes} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                    {this.props.children}
                </p>
            );
        }
    }
}

export default LinkNode;