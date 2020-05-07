import ReactDOM from 'react-dom';
import { DropTarget } from "react-dnd";
import { ItemTypes } from "../../dragtypes";

const blockTarget = {
    hover(props, monitor, component) {
        const mouse = monitor.getClientOffset();

        // calculate based on height of firstChild because if this is the last node in the doc, its outer div expands to fill the remaining vertical space
        const outerDiv = ReactDOM.findDOMNode(component)        
        const outerRect = outerDiv.getBoundingClientRect()
        
        var innerDiv;
        for (let item of outerDiv.children) {
            if (item.classList.contains('plain-block') || item.classList.contains('section')) {
                innerDiv = item;
                break;
            }
        }

        if (!innerDiv) {
            console.log('error: couldn\'t find the inner div!');
            return
        }
        const innerRect = innerDiv.getBoundingClientRect()       
    
        // subtract offset of the innerRect from the outerRect, to prevent the insertion of the drag indicator from affecting things
        const offset = (innerRect.y - outerRect.y)
        var newState = false
        if (mouse.y + offset > (innerRect.y + innerRect.height / 2)) {
            newState = true
        }
        if (component.state.overHalf !== newState) {
            component.setState({overHalf: newState});
        }
    },

    drop(props, monitor, component) {
        const document = props.editor.value.document;
        const blockParent = document.getParent(props.node.key);
        const blockIndex = blockParent.nodes.indexOf(props.node);
        return { droppedOnGraph: false, parentKey: blockParent.key, indexDroppedOn: blockIndex, insertBefore: component.state.overHalf }
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