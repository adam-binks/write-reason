import { Block, Text } from 'slate';
import { toast } from 'react-toastify';

function tryOrIgnore(tryBlock) {
    try {
        tryBlock()
    } catch(error) {
        // do nothing
    }
}

export default function GraphPlugin(options) {
    return {
        onMouseUp(event, editor, next) {
            var draggedNode = editor.getSharedState().draggedNode;

            if (draggedNode) {
                draggedNode.resetPos();

                if (editor.getSharedState().getGraphNode(draggedNode.id)) {
                    toast.error('You can\'t add the same node twice!')
                    console.log('Duplicate editor')
                } else {
                    const target = editor.findEventRange(event)
                    if (target) {
                        editor.select(target)

                        // prevent insertion inside an inline link
                        // (insertion inside a section is fixed by schema)
                        const linkNode = editor.value.inlines.find(inline => inline.type === 'link')
                        if (linkNode) {
                            editor.moveToEndOfNode(linkNode)
                        }

                        addSection(draggedNode, editor, target)
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
                if (node.type === "section") {
                    // move the children out from inside this section to be after it
                    const section_index = editor.value.document.nodes.indexOf(node)
                    if (section_index !== -1) {
                        var child_index = 0;
                        node.nodes.forEach(child => {
                            const nodeStyle = node.data.get("nodeStyle")
                            if ((child_index === 0 && nodeStyle === "Body only") || (child_index === 1 && nodeStyle === "Heading only")) {
                                tryOrIgnore(editor.removeNodeByKey(child.key))
                            } else {
                                tryOrIgnore(editor.moveNodeByKey(child.key, editor.value.document.key, section_index + child_index + 1))
                            }
                            child_index ++
                        });
                    }
                    tryOrIgnore(editor.removeNodeByKey(node.key))
                } else if (editor.value.document.getChild(node.key) || node.object === "inline") {           
                    tryOrIgnore(editor.setNodeByKey(node.key, {"type": ""}))
                }
            }
        }
    }
}

function addSection(draggedNode, editor, target) {
    // this bit seems necessary, taken from slate.js onDrop
    const { anchor } = target
    const document = editor.value.document
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
    var link = Block.create({
        type: 'link',
        data: {node_id: id},
        nodes: [Text.create({text: text})]
    })

    var body = Block.create({
        type: 'body',
        data: {node_id: id}
    })

    var section = Block.create({
        type: 'section',
        data: {node_id: id, nodeStyle: initialNodeStyle},
        nodes: [link, body]
    })
    editor.insertBlock(section);
    editor.moveToEndOfNode(section)

    return section
}

export function handleMouseUp(editor, clickedNode) {
    var draggedNode = editor.getSharedState().draggedNode;

    if (draggedNode) {
        draggedNode.resetPos();

        if (editor.getSharedState().getGraphNode(draggedNode.id)) {
            toast.error('You can\'t add the same node twice!')
            console.log('Duplicate - node');
            
        } else {
            const { value } = editor
            const { document } = value
            editor.focus()

            if (clickedNode.type === "body" || clickedNode.type === "link") {
                clickedNode = document.getParent(clickedNode);
            }

            editor.moveToEndOfNode(clickedNode);

            addSection(draggedNode, editor, editor.value.selection);

            editor.getSharedState().draggedNode = false;
            return true;
        }
    }
}