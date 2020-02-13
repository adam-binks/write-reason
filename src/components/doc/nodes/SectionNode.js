import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';
import { handleMouseUp } from '../GraphPlugin';
import { showNodeSwitchMenu, getNodeStyleClass } from '../NodeSwitch';

class SectionNode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            externalHover: false,
            nodeStyle: props.node.data.get("nodeStyle")
        }
        this.setHover = this.setHover.bind(this);
    }

    setHover(newHover) {     
        var node = this.props.sharedState.getGraphNode(this.props.nodeId);
        if (node) {
            node.setHoverer("section_mouse", newHover);
        }

        this.setState({hover: newHover});
    }
    
    setExternalHover(isHovered) {
        this.setState({externalHover: isHovered});
    }

    render() {
        const { isOverCurrent, connectDropTarget, connectDragSource, dragPreview, isDragging } = this.props;

        const value = this.props.editor.value
        var cursorInside = value.blocks && value.blocks.some(block => block === this.props.node || this.props.node.nodes.includes(block))

        var hoverClass = (this.state.externalHover || cursorInside) ? " hovered" : "";
        var classes = "section plain-block " + hoverClass  + (isDragging ? " display-none" : "");
        classes += getNodeStyleClass(this.state.nodeStyle)

        if (this.props.node.data.get("nodeStyle") !== this.state.nodeStyle) {
            console.log("update");
            
            this.props.editor.setNodeByKey(this.props.node.key, {nodeStyle: this.state.nodeStyle})
        }

        console.log("style " + this.props.node.data.get("nodeStyle"));
        

        return connectDropTarget(
            <div className={classes} {...this.props.attributes} 
                    onMouseEnter={() => this.setHover(true)} onMouseLeave={() => this.setHover(false)} 
                    onMouseUp={() => {handleMouseUp(this.props.editor, this.props.node) && this.setState({hover: false})}}
                    onContextMenu={(e) => showNodeSwitchMenu(e, this.state, this.setState.bind(this), this.props.node, this.props.editor)}
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