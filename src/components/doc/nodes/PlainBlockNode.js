import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';
import { handleMouseUp } from '../GraphPlugin';

class PlainBlockNode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: false
        }
        this.toggleHover = this.toggleHover.bind(this);
    }

    toggleHover() {
        this.setState({hover: !this.state.hover});
    }

    render() {
        const { isOverCurrent, connectDropTarget, connectDragSource, dragPreview, isDragging } = this.props

        const classes = "plain-block " + (isDragging ? " display-none" : "")

        return connectDropTarget(
            <div className={classes} {...this.props.attributes} 
                    onMouseUp={() => {handleMouseUp(this.props.editor, this.props.node) && this.setState({hover: false})}} 
                    onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}
                    ref={connectDragSource}>
                {(isOverCurrent && !this.state.overHalf && <div className="drop-indicator" />)}
                {/* <div  className="drag-handle"/> */}
                {this.props.children}
                {(isOverCurrent && this.state.overHalf && <div className="drop-indicator" />)}
                {(this.state.hover && this.props.editor.getSharedState().draggedNode) && <div className="drop-indicator" />}
            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(PlainBlockNode))