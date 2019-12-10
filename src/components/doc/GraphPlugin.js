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
                    editor.select(target)

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

                    // insert the link
                    editor.insertInline({
                        type: 'link',
                        data: {node_id: draggedNode.id}
                    })
                    editor.insertText(draggedNode.text)

                    editor.getSharedState().addGraphMapping(draggedNode.id, draggedNode.node)
                }
            }
            next();
        },
        
        onBlur(event, editor, next) {
            editor.deselect();
            next();
        }
    }
}