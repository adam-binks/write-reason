import React, { Component } from 'react';

class LinkNode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            externalHover: false
        }
        
        this.setHover = this.setHover.bind(this);
    }

    setHover(newHover) {
        if (this.props.linkStyle === "inline") {
            var node = this.props.sharedState.getGraphNode(this.props.nodeId);
            if (node) {
                node.setHovered(newHover);
            }
        }

        this.setState({hover: newHover});
    }
    
    setExternalHover(isHovered) {
        this.setState({externalHover: isHovered});
    }

    render() {
        const { value } = this.props.editor;
        const { document, selection } = value;
        var cursorInside = document.getDescendantsAtRange(selection).contains(this.props.node)
        var node = this.props.sharedState.getGraphNode(this.props.nodeId);
        if (node && !this.state.hover) {
            node.setHovered(cursorInside);
        }
        
        var hoverClass = (this.state.externalHover || cursorInside) ? " hovered" : "";
        var classes = "node-link" + hoverClass;

        if (this.props.linkStyle === "heading") {
            return (
                <p className={classes} {...this.props.attributes} onMouseEnter={() => this.setHover(true)} onMouseLeave={() => this.setHover(false)}>
                    <u><b>{this.props.children}</b></u>
                </p>
            );

        } else if (this.props.linkStyle === "inline") {
            return (
                <p className={classes} {...this.props.attributes} onMouseEnter={() => this.setHover(true)} onMouseLeave={() => this.setHover(false)}>
                    {this.props.children}
                </p>
            );
        }
    }
}

export default LinkNode;