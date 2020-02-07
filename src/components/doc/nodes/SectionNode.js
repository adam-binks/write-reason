import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';
import { handleMouseUp } from '../GraphPlugin';

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
        const { isOverCurrent, connectDropTarget, connectDragSource, dragPreview, isDragging } = this.props;

        var hoverClass = this.state.externalHover ? " hovered" : "";
        var classes = "section plain-block " + hoverClass  + (isDragging ? " display-none" : "");

        return connectDropTarget(
            <div className={classes} {...this.props.attributes} 
                    onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} 
                    onMouseUp={() => {handleMouseUp(this.props.editor, this.props.node) && this.setState({hover: false})}}
                    ref={dragPreview}>
                {(isOverCurrent && !this.state.overHalf && <div className="drop-indicator" />)}
                <div ref={connectDragSource} className="drag-handle" />
                {this.props.children}
                {(isOverCurrent && this.state.overHalf && <div className="drop-indicator" />)}
                {(this.state.hover && this.props.editor.getSharedState().draggedNode) && <div className="drop-indicator" />}
            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(SectionNode))