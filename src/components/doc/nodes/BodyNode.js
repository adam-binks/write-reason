import React, { Component } from 'react';

export default class BodyNode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            externalHover: false
        }
        this.setHover = this.setHover.bind(this);
        this.selectNode = props.selectNode;
    }

    setHover(newHover) {
        this.setState({hover: newHover});
    }
    
    setExternalHover(isHovered) {
        this.setState({externalHover: isHovered});
    }

    render() {
        var hoverClass = (this.state.externalHover || this.state.hover) ? " hovered" : "";
        var classes = "node-body" + hoverClass + (this.props.isEmpty ? " placeholder" : "");

        const { value } = this.props.editor;
        const { document, selection } = value;
        var cursorInside = document.getDescendantsAtRange(selection).contains(this.props.node)
        var node = this.props.sharedState.getGraphNode(this.props.nodeId);
        if (node && !this.state.hover) {
            node.setHovered(cursorInside);
        }

        if (this.props.isEmpty) {
                return (
                    <p className={classes} {...this.props.attributes} onMouseDown={this.selectNode}>
                        Type some text...{this.props.children}
                    </p>
                );
        } else {
            return (
                <p className={classes} {...this.props.attributes}>
                    {this.props.children}
                </p>
            );
        }
    }
}