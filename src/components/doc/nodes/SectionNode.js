import React, { Component } from 'react';
import { DragSource } from 'react-dnd';

const blockSource = {
    beginDrag(props) {
      // Return the data describing the dragged item
      const item = { id: props.node.id }
      return item
    },

    endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {
            return
        }

        // When dropped on a compatible target, do something
        const item = monitor.getItem()
        const dropResult = monitor.getDropResult()
        //   CardActions.moveCardToList(item.id, dropResult.listId)
        console.log("drop " + item);
    },
  }

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDragSource: connect.dragSource(),
        // You can ask the monitor about the current drag state:
        isDragging: monitor.isDragging(),
    }
}

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
        var classes = "section" + hoverClass;

        const { connectDragSource } = this.props;

        return connectDragSource(
            <div className={classes} {...this.props.attributes} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                <div className="drag-handle" />
                {this.props.children}
            </div>
        );
    }
}

export default DragSource("Block", blockSource, collect)(SectionNode)