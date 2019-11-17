import React from 'react';

export default function GraphPlugin(options) {
    return {
        onMouseUp(event, editor, next) {
            var draggedNode = editor.getSharedState().draggedNode;

            if (draggedNode) {
                draggedNode.resetPos();

                const { value } = editor
                const { document, selection } = value

                const target = editor.findEventRange(event)
                editor.select(target)

                const { anchor } = target
                let hasVoidParent = document.hasVoidParent(anchor.path, editor)

                // this bit seems necessary, taken from slate.js onDrop
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
                    type: 'link'
                })
                editor.insertText(draggedNode.text)
            }
            next();
        },
        
        onBlur(event, editor, next) {
            editor.deselect();
            next();
        }
    }
}