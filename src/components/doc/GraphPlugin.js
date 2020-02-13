import { Block } from 'slate';

export default function GraphPlugin(options) {
    return {
        onMouseUp(event, editor, next) {
            var draggedNode = editor.getSharedState().draggedNode;

            if (draggedNode) {
                draggedNode.resetPos();

                if (editor.getSharedState().getGraphNode(draggedNode.id)) {
                    // todo possibly display a message to the user?
                    console.log("Duplicate!");
                } else {
                    const { value } = editor
                    const { document, selection } = value
                    const target = editor.findEventRange(event)
                    if (target) {
                        editor.select(target)
                        addSection(value, document, selection, draggedNode, editor, target)
                    }
                }
            }
            next();
        },
        
        onBlur(event, editor, next) {
            editor.deselect();
            next();
        },

        commands: {
            removeGraphLink(editor, node) {
                editor.setNodeByKey(node.key, {"type": ""})
            }
        }
    }
}

function addSection(value, document, selection, draggedNode, editor, target) {
    // this bit seems necessary, taken from slate.js onDrop
    const { anchor } = target
    let hasVoidParent = document.hasVoidParent(anchor.path, editor)
    if (hasVoidParent) {
        let p = anchor.path
        let n = document.getNode(anchor.path)
        while (hasVoidParent) {
            const [nxt] = document.texts({ path: p })
            if (!nxt) {
                break
            }
            ;[n, p] = nxt
            hasVoidParent = document.hasVoidParent(p, editor)
        }
        if (n) editor.moveToStartOfNode(n)
    }

    editor.getSharedState().addGraphMapping(draggedNode.id, draggedNode.node)

    insertSectionBlock(editor, draggedNode.id, draggedNode.text, draggedNode.longText, "Heading and body")

    editor.getSharedState().logger.logEvent({
        'type': 'doc_create_from_node', 
        'node_id': draggedNode.id, 
        'short_text': draggedNode.text, 
        'long_text': draggedNode.longText
    });
}

export function insertSectionBlock(editor, id, text, longText, initialNodeStyle) {
    var section = Block.create({
        type: 'section',
        data: {node_id: id, nodeStyle: initialNodeStyle}
    })
    editor.insertBlock(section);
    editor.moveTo(section.key)

    // insert the link
    var link = Block.create({
        type: 'link',
        data: {node_id: id}
    })
    editor.insertNodeByKey(section.key, 0, link); // just doing this once seems to make everything else insert into the section too:)
    editor.insertText(text)

    // add the body of the node
    editor.insertBlock({
        type: 'body',
        data: {node_id: id}
    })
    editor.insertText(longText)

    return section
}

export function handleMouseUp(editor, clickedNode) {
    var draggedNode = editor.getSharedState().draggedNode;

    if (draggedNode) {
        draggedNode.resetPos();

        if (editor.getSharedState().getGraphNode(draggedNode.id)) {
            // todo possibly display a message to the user?
            console.log("Duplicate! 2");
        } else {
            const { value } = editor
            const { document, selection } = value
            editor.focus()

            if (clickedNode.type === "body" || clickedNode.type === "link") {
                clickedNode = document.getParent(clickedNode);
            }

            editor.moveToEndOfNode(clickedNode);

            addSection(value, document, selection, draggedNode, editor, editor.value.selection);
            return true;
        }
    }
}