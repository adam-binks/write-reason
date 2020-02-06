import { DropTarget } from "react-dnd";
import { ItemTypes } from "../../dragtypes";

const blockTarget = {
    drop(props, monitor, component) {
        const document = props.editor.value.document;
        const blockParent = document.getParent(props.node.key);
        const blockIndex = blockParent.nodes.indexOf(props.node);
        return { parentKey: blockParent.key, indexDroppedOn: blockIndex }
    },
}

function collect(connect, monitor) {
    return {
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDropTarget: connect.dropTarget(),
        // You can ask the monitor about the current drag state:
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
        itemType: monitor.getItemType(),
    }
}

export default DropTarget(ItemTypes.BLOCK, blockTarget, collect)