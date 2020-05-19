import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock, { isOverHalf } from '../DropifyBlock';
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

        const dragOverCurrent = isOverCurrent || (this.state.hover && this.props.editor.getSharedState().draggedNode)

        return connectDropTarget(
            <div className='block-outer-div'
                onMouseUp={() => {handleMouseUp(this.props.editor, this.props.node, this.state.overHalf) && this.setState({hover: false})}} 
                onMouseEnter={() => this.setHover(true)}
                onMouseOver={() => this.setHover(true)}
                onMouseLeave={() => this.setHover(false)}
                onMouseMove={(e) => isOverHalf(this, e)}>

                {(dragOverCurrent && !this.state.overHalf && <div className="drop-indicator" />)}
                <div className={classes} {...this.props.attributes} ref={connectDragSource}>
                    {this.props.children}
                </div>
                {(dragOverCurrent && this.state.overHalf && <div className="drop-indicator" />)}

            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(PlainBlockNode))