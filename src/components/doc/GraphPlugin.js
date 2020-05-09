import { Block, Text } from 'slate';
import { toast } from 'react-toastify';

export default function GraphPlugin(options) {
    return {
        onMouseUp(event, editor, next) {
            var draggedNode = editor.getSharedState().draggedNode;

            if (draggedNode) {
                draggedNode.resetPos();

                if (editor.getSharedState().getGraphNode(draggedNode.id)) {
                    toast.error('You can\'t add the same node twice!')
                    console.log('Duplicate - editor')
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

                        addSection(draggedNode, editor)
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
                const document = editor.value.document
                if (!document.hasNode(node.key)) {
                    console.log('couldnt remove graph link, node doesnt exist');
                    
                    return
                }

                if (node.type === "section") {
                    // move the children out from inside this section to be after it
                    const section_index = editor.value.document.nodes.indexOf(node)
                    if (section_index !== -1) {
                        var child_index = 0;
                        node.nodes.forEach(child => {
                            if (!document.hasNode(child.key)) {
                                return
                            }

                            const nodeStyle = node.data.get("nodeStyle")
                            if ((child_index === 0 && nodeStyle === "Body only") || (child_index === 1 && nodeStyle === "Heading only")) {
                                editor.removeNodeByKey(child.key)
                            } else {
                                editor.moveNodeByKey(child.key, editor.value.document.key, section_index + child_index + 1)
                            }
                            child_index ++
                        });
                    }
                    editor.removeNodeByKey(node.key)
                } else if (editor.value.document.getChild(node.key) || node.object === "inline") {           
                    editor.setNodeByKey(node.key, {"type": ""})
                }
            }
        }
    }
}

export function addSection(draggedNode, editor, initialNodeStyle="Heading and body") {
    editor.getSharedState().addGraphMapping(draggedNode.id, draggedNode.node)

    console.log(draggedNode);
    

    insertSectionBlock(editor, draggedNode.id, draggedNode.text, draggedNode.longText, initialNodeStyle)

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
        data: {node_id: id},
        nodes: [Text.create({text: longText})]
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

            addSection(draggedNode, editor);

            editor.getSharedState().draggedNode = false;
            return true;
        }
    }
}