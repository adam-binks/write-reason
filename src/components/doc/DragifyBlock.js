import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../dragtypes';

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

        const dropResult = monitor.getDropResult()

        const document = props.editor.value.document;
        const blockParent = document.getParent(props.node.key);
        const blockIndex = blockParent.nodes.indexOf(props.node);
        const indexShift = dropResult.indexDroppedOn > blockIndex ? 1 : 0

        props.editor.moveNodeByKey(props.node.key, dropResult.parentKey, dropResult.indexDroppedOn - indexShift)


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
        isDragging: monitor.isDragging(),
    }
}

export default DragSource(ItemTypes.BLOCK, blockSource, collect)