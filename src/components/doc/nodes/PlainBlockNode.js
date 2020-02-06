import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';

class PlainBlockNode extends Component {
    render() {
        const { isOverCurrent, connectDropTarget, connectDragSource } = this.props

        return connectDragSource(connectDropTarget(
            <div {...this.props.attributes}>
                {isOverCurrent && <div className="drop-indicator" />}
                <div className="drag-handle" />
                {this.props.children}
            </div>
        ));
    }
}

export default DragifyBlock(DropifyBlock(PlainBlockNode))