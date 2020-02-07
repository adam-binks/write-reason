import ReactDOM from 'react-dom';
import { DropTarget } from "react-dnd";
import { ItemTypes } from "../../dragtypes";

const blockTarget = {
    hover(props, monitor, component) {
        const mouse = monitor.getClientOffset();
        const rect = ReactDOM.findDOMNode(component).getBoundingClientRect();
        
        if (mouse.y > (rect.y + rect.height / 2)) {
            component.setState({overHalf: true});
        } else {
            component.setState({overHalf: false});
        }
    },

    drop(props, monitor, component) {
        const document = props.editor.value.document;
        const blockParent = document.getParent(props.node.key);
        const blockIndex = blockParent.nodes.indexOf(props.node);
        return { parentKey: blockParent.key, indexDroppedOn: blockIndex, insertBefore: component.state.overHalf }
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