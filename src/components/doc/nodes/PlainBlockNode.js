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
        this.setHover = this.setHover.bind(this);
    }

    setHover(newHover) {
        this.setState({hover: newHover});
    }

    render() {
        const { isOverCurrent, connectDropTarget, connectDragSource, isDragging } = this.props

        const classes = "plain-block " + (isDragging ? " display-none" : "")

        return connectDropTarget(
            <div>
                {(isOverCurrent && !this.state.overHalf && <div className="drop-indicator" />)}
                <div className={classes} {...this.props.attributes} 
                        onMouseUp={() => {handleMouseUp(this.props.editor, this.props.node) && this.setState({hover: false})}} 
                        onMouseEnter={() => this.setHover(true)} onMouseOver={() => this.setHover(true)} onMouseLeave={() => this.setHover(false)}
                        ref={connectDragSource}>
                    {this.props.children}
                </div>
                {(isOverCurrent && this.state.overHalf && <div className="drop-indicator" />)}
                {(this.state.hover && this.props.editor.getSharedState().draggedNode) && <div className="drop-indicator" />}
            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(PlainBlockNode))