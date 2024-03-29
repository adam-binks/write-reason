import React from 'react';
import LinkNode from './nodes/LinkNode.js'
import BodyNode from './nodes/BodyNode.js'
import SectionNode from './nodes/SectionNode.js'
import { Block } from 'slate'
import { getEventTransfer } from 'slate-react';
import { deleteNode } from './NodeSwitch.js'

export default function LinkPlugin(options) {
    return {
        commands: {
            wrapLinkAtSelection(editor, node_id) {
                return editor.wrapInline({
                    type: "link",
                    data: { "node_id": node_id, "nodeStyle": "Inline" }
                });
            }
        },

        renderInline(props, editor, next) {
            if (props.node.type === 'link') {
                var { ref, id } = getRefAndId(props, editor, "short");

                return <LinkNode ref={ref} {...props} linkStyle="inline" sharedState={editor.getSharedState()} nodeId={id}/>
            }

            return next();
        },

        renderBlock(props, editor, next) {
            var refAndId;

            if (props.node.type === 'body') {
                refAndId = getRefAndId(props, editor, "long");

                // set up the placeholder text to only appear when the body is empty and no text is selected
                var isEmpty = !props.node.text

                var selectNode = () => {
                    setTimeout(() => {editor.focus(); editor.moveToStartOfNode(props.node);}, 0)
                }

                return <BodyNode
                            ref={refAndId.ref}
                            {...props}
                            sharedState={editor.getSharedState()}
                            nodeId={refAndId.id}
                            isEmpty={isEmpty}
                            selectNode={selectNode}
                        />

            } else if (props.node.type === 'link') {
                refAndId = getRefAndId(props, editor, "short");

                return <LinkNode
                            ref={refAndId.ref}
                            {...props}
                            linkStyle="heading"
                            sharedState={editor.getSharedState()}
                            nodeId={refAndId.id}
                        />

            } else if (props.node.type === 'section') {
                refAndId = getRefAndId(props, editor, "section");

                return <SectionNode
                    ref={refAndId.ref}
                    {...props}
                    sharedState={editor.getSharedState()}
                    nodeId={refAndId.id}
                />
            }

            return next();
        },

        onDrop(event, editor, next) {
            // suppress drop events
            // do not call next()
        },

        onPaste(event, editor, next) {
            const getLinkInlines = (the_doc) => the_doc.filterDescendants(node => node.type === 'link' && node.object === 'inline')

            var transfer = getEventTransfer(event);

            if (transfer.type === "fragment") {

                // if pasting into a link or body, just paste plain text, not a fragment
                if (editor.value.blocks.some(block => block.type === "link" || block.type === "body")) {
                    const textNoNewlines = transfer.fragment.text.replace(/(\r\n|\n|\r)/gm, "")
                    editor.insertText(textNoNewlines)

                    // NB: no next() call, so this plugin must be the last one in the stack that handles onPaste()
                    return
                }

                const fragmentInlines = getLinkInlines(transfer.fragment)

                if (fragmentInlines) {
                    const docInlines = getLinkInlines(editor.value.document)
                    const usedIds = []
                    docInlines.forEach(inline => {usedIds.push({key: inline.key, id: inline.data.get("node_id")})})
                    
                    // let the paste happen so we can operate on the document instead of inline
                    next()

                    // if an inline in the pasted content has the same id as one in the document, unwrap the pasted inline
                    fragmentInlines.forEach(inline => {
                        usedIds.forEach(usedId => {
                            const id = inline.data.get("node_id")
                            if (usedId.id === id) {
                                const inlinesWithId = editor.value.document.filterDescendants(node => node.type === 'link' && node.object === 'inline' && node.data.get('node_id') === id)
                                inlinesWithId.forEach(inlineWithId => {
                                    if (inlineWithId.key !== usedId.key) {
                                        editor.unwrapInlineByKey(inlineWithId.key)
                                    }
                                })
                            }
                        })
                    })
                }
            } else {
                next()
            }
        },

        onChange(editor, next) {
            // update all node texts (both link and body)
            const sharedState = editor.getSharedState();
            [
                {nodeType: 'link', updateFunc: sharedState.updateGraphShortText.bind(sharedState)},
                {nodeType: 'body', updateFunc: sharedState.updateGraphLongText.bind(sharedState)}
            ].forEach( update =>
                editor.value.blocks.forEach(block => {
                    const updateText = (linkNode) => {
                        // if we've just emptied an inline text node, we should delete the node and its link to the graph
                        // also if we ever have a link node disconnected from the graph, just remove it to restore legal state
                        const id = linkNode.data.get('node_id')
                        sharedState.checkRecycleBinForGraphNode(id) // in case there was an undo and redo, we should restore the graph link
                        if (linkNode.object === 'inline' && (linkNode.text === "" || !sharedState.getGraphNode(id))) {
                            deleteNode(linkNode, editor)
                        } else {
                            update.updateFunc(linkNode.data.get("node_id"), linkNode.text)
                        }
                    }

                    var linkNodes = block.filterDescendants(node => node.type === update.nodeType)
                    linkNodes.forEach(updateText)

                    if (block.type === update.nodeType) {
                        updateText(block)
                    }
                })
            )

            next()
        },

        onKeyDown(e, editor, next) {
            const { value } = editor
            const { document, selection, startBlock} = value
            const { start, end } = selection

            // if a whole section (block or inline) is deleted, tell the graph node
            if ((e.key === 'Backspace' || e.key === 'Delete') && selection.isExpanded) {
                document.getDescendantsAtRange(selection).forEach(node => {
                    if (node.type === 'section' || node.type === 'link') {
                        // it's not certain whether the section will be deleted, as it may only be partially selected
                        // so check in 0 seconds, once the deletion happens, whether that's the case
                        setTimeout(() => {
                            editor.getSharedState().updateIsOnGraphStatus(node.data.get('node_id'))
                        }, 0)
                    }
                })
            }

            // prevent delete key from merging body and link blocks with next
            if (e.key === "Delete") {
                if (startBlock && value.selection.isCollapsed && value.selection.end.isAtEndOfNode(startBlock)) {
                    const nextBlock = document.getNextBlock(start.key)
                    if (nextBlock && (nextBlock.type === "body" || nextBlock.type === "link" || nextBlock.type === "section")) {
                        editor.moveToStartOfNode(nextBlock);
                        if (startBlock.text === "") {
                            editor.removeNodeByKey(startBlock.key)
                        }
                        return
                    }
                }
            }

            // prevent backspace from merging body and link blocks with previous
            if (e.key === 'Backspace') {
                const prevBlock = document.getPreviousBlock(start.key)
                if (startBlock && selection.isCollapsed && start.offset === 0 && prevBlock && (startBlock.type === "body" || startBlock.type === "link")) {
                    if (prevBlock) {
                        editor.moveToEndOfNode(prevBlock);
                        if (startBlock.text === "") {
                            editor.removeNodeByKey(startBlock.key)
                        } else if (prevBlock.text === "") {
                            editor.removeNodeByKey(prevBlock.key)
                         }
                    }
                    return editor
                }
            }

            if (e.key === 'Enter') {
                if (value.inlines.some(inline => inline.type === 'link')) {
                    return // do nothing to avoid splitting the link
                }

                // when enter is pressed inside a link *block* (not inline), just go to body
                if (startBlock && startBlock.type === "link" && start.key === end.key) {
                    // unless the offset is 0, in which case insert a block before and go to that
                    if (start.offset === 0) {
                        const blockToInsert = Block.create({object: 'block', type: ''})
                        const section = document.getParent(startBlock.key);
                        const sectionParent = document.getParent(section.key);                    
                        const sectionIndex = sectionParent.nodes.indexOf(section);

                        editor.insertNodeByKey(sectionParent.key, sectionIndex, blockToInsert);
                        return editor.moveBackward(1)
                    } else {
                        const nextBlock = document.getNextBlock(start.key)
                        if (nextBlock) {
                            return editor.moveToStartOfNode(nextBlock);
                        } else {
                            return editor.moveToEndOfNode(startBlock);
                        }
                    }
                }
            }
            
            // prevent the cursor disappearing when navigating into the body placeholder text
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const relevantBlock = e.key === 'ArrowDown' ? document.getNextBlock(start.key) : document.getPreviousBlock(start.key)
                const ESTIMATED_CHARS_PER_LINE = 130 // calibrated on a 1920x1080 screen... :/
                // we only need to handle the case where the cursor offset is < the length of the placeholder
                if (relevantBlock && relevantBlock.type === 'body' && start.offset < 'Type some text... '.length) {
                    // if down arrow was pressed, only jump to the body if there is only one line of text in the block
                    // its hard to work out how many lines of text there so use an estimate
                    if (e.key === 'ArrowUp' || startBlock.text.length < ESTIMATED_CHARS_PER_LINE) {
                        editor.moveToEndOfNode(relevantBlock)
                        e.preventDefault()
                        return
                    }
                }
            }

            // prevent tab from taking focus from the editor
            if (e.key === 'Tab') {
                e.preventDefault()
            }

            return next()
        }
    }

    function getRefAndId(props, editor, long_or_short) {
        var id = props.node.data.get("node_id");
        editor.getSharedState().setLinkMapping(id, props.node, long_or_short);
        var ref = React.createRef();
        editor.getSharedState().registerLinkNode(id, ref, long_or_short);
        return { ref, id };
    }
}