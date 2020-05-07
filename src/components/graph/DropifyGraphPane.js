import { DropTarget } from "react-dnd";
import { ItemTypes } from "../../dragtypes";

const graphTarget = {
    canDrop(props, monitor) {
        const item = monitor.getItem()
        return item.node.type !== 'section' && !item.node.findDescendant(node => node.type === 'link')
    },

    drop(props, monitor, component) {
        return { droppedOnGraph: true, position: monitor.getClientOffset() }
    },
}

function collect(connect, monitor) {
    return {
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDropTarget: connect.dropTarget(),
        // You can ask the monitor about the current drag state:
        itemType: monitor.getItemType(),
    }
}

export default DropTarget(ItemTypes.BLOCK, graphTarget, collect)