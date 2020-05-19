import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';
import { handleMouseUp } from '../GraphPlugin';
import { getNodeStyleClass } from '../NodeSwitch';
import StyleButton from '../StyleButton';

class SectionNode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            externalHover: false,
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
        const { isOverCurrent, connectDropTarget, connectDragSource, isDragging } = this.props;

        const value = this.props.editor.value
        var cursorInside = value.blocks && value.blocks.some(block => block === this.props.node || this.props.node.nodes.includes(block))

        var hoverClass = (this.state.externalHover || cursorInside) ? " hovered" : "";
        var classes = "section plain-block " + hoverClass  + (isDragging ? " display-none" : "");
        classes += getNodeStyleClass(this.props.node.data.get("nodeStyle"))

        return connectDropTarget(
            <div className='block-outer-div'>
                {(isOverCurrent && !this.state.overHalf && <div className="drop-indicator" />)}
                <div className={classes} {...this.props.attributes} 
                        onMouseEnter={() => this.setHover(true)} onMouseOver={() => this.setHover(true)} onMouseLeave={() => this.setHover(false)} 
                        onMouseUp={() => {handleMouseUp(this.props.editor, this.props.node) && this.setState({hover: false})}}
                        ref={connectDragSource}>
                    {this.state.hover && <StyleButton node={this.props.node} editor={this.props.editor} nodeStyle='section' />}
                    {this.props.children}
                </div>
                {(isOverCurrent && this.state.overHalf && <div className="drop-indicator" />)}
                {(this.state.hover && this.props.editor.getSharedState().draggedNode) && <div className="drop-indicator" />}
            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(SectionNode))