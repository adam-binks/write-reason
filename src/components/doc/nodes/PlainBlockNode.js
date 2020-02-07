import React, { Component } from 'react';
import DragifyBlock from '../DragifyBlock';
import DropifyBlock from '../DropifyBlock';

class PlainBlockNode extends Component {
    constructor(props) {
        super(props);

        this.selfRef = React.createRef();
    }

    render() {
        const { isOverCurrent, connectDropTarget, connectDragSource, dragPreview } = this.props

        return connectDropTarget(
            <div className="plain-block" {...this.props.attributes} ref={dragPreview}>
                {isOverCurrent && <div className="drop-indicator" />}
                <div ref={connectDragSource} className="drag-handle"/>
                {this.props.children}
            </div>
        );
    }
}

export default DragifyBlock(DropifyBlock(PlainBlockNode))