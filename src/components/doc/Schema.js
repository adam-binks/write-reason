import { Block, Text } from 'slate';

export const schema = {
    inlines: {
        link: {
            parent: [{type: ''}, {type: 'paragraph'}],

            normalize: (editor, error) => {
                switch (error.code) {
                    case 'parent_type_invalid':
                        editor.unwrapInlineByKey(error.node.key)
                        return

                    default:
                        console.log("unhandled link inline err " + error);
                }
            }
        }
    },

    blocks: {
        section: {
            parent: {object: "document"},
            nodes: [
                {
                    match: {type: 'link'},
                    min: 1,
                    max: 1,
                },
                {
                    match: {type: 'body'},
                    min: 1,
                    max: 1,
                }
            ],

            normalize: (editor, error) => {
                switch (error.code) {
                    case 'child_max_invalid':
                        // if we somehow end up with multiple headings/bodies inside the section, make it a paragraph move it after the section                     
                        // this can happen if the enter key is pressed (splits the current node)
                        moveBlockAfterSection(editor, error.child, error.node)
                        editor.setNodeByKey(error.child.key, 'paragraph')
                        return

                    case 'child_type_invalid':
                        // if we somehow end up with a paragraph inside the section, put the content in the heading instead                     
                        if (error.child.object === "text" || error.child.type === "paragraph") {
                            const linkNode = error.node.nodes.find(node => node.type === 'link')
                            if (linkNode) {
                                const textNode = linkNode.getLastText()
                                const offset = textNode.text ? textNode.text.length : 0
                                editor.insertTextByKey(textNode.key, offset, error.child.text)
                            } else {
                                addMissing(editor, error, "link", error.child.text)
                            }
                        }

                        editor.removeNodeByKey(error.child.key)
                        
                        return
                    
                    case 'child_min_invalid':
                        var hasChildTypes = [];
                        error.node.nodes.forEach(node => {
                            hasChildTypes.push(node.type)
                        })
                        
                        if (!hasChildTypes.includes("link")) {
                            addMissing(editor, error, "link")
                        }

                        if (!hasChildTypes.includes("body")) {
                            addMissing(editor, error, "body")
                        }

                        return
                    
                    case 'parent_object_invalid':
                        // a section has ended up inside another section - shift it out
                        moveBlockAfterSection(editor, error.node, error.parent)
                        return

                    default:
                        console.log("unhandled section schema err " + error);
                        
                        return
                }
            }
        },
    }
}

function moveBlockAfterSection(editor, blockToMove, sectionToMoveAfter) {
    const sectionIndex = editor.value.document.nodes.indexOf(sectionToMoveAfter)
    if (sectionIndex === -1) {
        return
    }
    editor.moveNodeByKey(blockToMove.key, editor.value.document.key, sectionIndex + 1)
}

function addMissing(editor, error, nodeType, text="") {
    const node_id = error.node.data.get("node_id")
    const graphNode = editor.getSharedState().getGraphNode(node_id)
    if (!text) {
        text = nodeType === "link" ? graphNode.getShortText() : graphNode.getLongText()
    }
    const index = nodeType === "link" ? 0 : 1

    addBlock(editor, error.node, nodeType, index, node_id, text)
}

function addBlock(editor, parent, nodeType, index, id, text) {
    var block = Block.create({
        type: nodeType,
        data: {node_id: id},
        nodes: [Text.create({'text': text})]
    })
    editor.insertNodeByKey(parent.key, index, block);
    
}