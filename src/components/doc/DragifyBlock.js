import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../dragtypes';
import { addSection } from './GraphPlugin.js'

const blockSource = {
    canDrag(props) {
        // don't drag if there is a non-collapsed selection, so it doesn't interfere with dragging selections to graph
        return props.editor.value.selection.isCollapsed
    },

    beginDrag(props) {
      // Return the data describing the dragged item
      const item = { id: props.node.id, node: props.node }
      return item
    },

    endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {            
            return
        }

        const dropResult = monitor.getDropResult()
        const sharedState = props.editor.getSharedState()

        if (dropResult.droppedOnGraph) {
            const graphNode = sharedState.addGraphNode('', dropResult.position.x, dropResult.position.y, true)
            const draggedNode = {
                id: graphNode.id,
                node: graphNode,
                text: "",
                longText: props.node.text
            }
            props.editor.moveTo(props.node.key)
            
            addSection(draggedNode, props.editor, "Body only")
            props.editor.removeNodeByKey(props.node.key)
            props.editor.blur()
        } else {
            const document = props.editor.value.document;
            const blockParent = document.getParent(props.node.key);
            const blockIndex = blockParent.nodes.indexOf(props.node);
            const indexShift = (dropResult.insertBefore ? 1 : 0) - (dropResult.indexDroppedOn > blockIndex ? 1 : 0)

            props.editor.moveNodeByKey(props.node.key, dropResult.parentKey, dropResult.indexDroppedOn + indexShift)

            sharedState.logger.logEvent({
                'type': 'reorder',
                'id': props.node.data.get('node_id'),
                'old_index': blockIndex,
                'new_index': dropResult.indexDroppedOn + indexShift,
            });
        }
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
        dragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    }
}

export default DragSource(ItemTypes.BLOCK, blockSource, collect)