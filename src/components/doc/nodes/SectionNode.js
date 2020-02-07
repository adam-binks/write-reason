import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';

class SectionNode extends Component {
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
        var classes = "section plain-block " + hoverClass;

        const { isOverCurrent, connectDropTarget, connectDragSource, dragPreview } = this.props;

        return connectDropTarget(
            <div className={classes} {...this.props.attributes} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} ref={dragPreview}>
                {isOverCurrent && <div className="drop-indicator" />}
                <div ref={connectDragSource} className="drag-handle" />
                {this.props.children}
            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(SectionNode))