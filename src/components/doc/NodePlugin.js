import React from 'react';
import LinkNode from './LinkNode.js'
import BodyNode from './BodyNode.js'
import {Block} from 'slate'

export default function LinkPlugin(options) {
    return {
        commands: {
            wrapLinkAtSelection(editor, node_id) {
                return editor.wrapInline({
                    type: "link",
                    data: { "node_id": node_id }
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
            if (props.node.type === 'body') {
                var { ref, id } = getRefAndId(props, editor, "long");

                return <BodyNode ref={ref} {...props} sharedState={editor.getSharedState()} nodeId={id}/>

            } else if (props.node.type === 'link') {
                var { ref, id } = getRefAndId(props, editor, "short");

                return <LinkNode ref={ref} {...props} linkStyle="heading" sharedState={editor.getSharedState()} nodeId={id}/>
            }

            return next();
        },

        onDrop(event, editor, next) {
            console.log('drop');
            next();
        },

        onChange(editor, next) {
            const { value } = editor;
            const { document, selection } = value;
            var inlines = document.getLeafInlinesAtRange(selection);
            var blocks = document.getLeafBlocksAtRange(selection).filter(block => {return block.type === "link"});
            [inlines, blocks].forEach(nodes => {
                if (nodes) {
                    nodes.forEach(node => {
                        var fullText = "";
                        node.getTexts().forEach(text => {
                            fullText += text.text;
                        })
                        editor.getSharedState().updateGraphShortText(node.data.get("node_id"), fullText);
                    });
                }
            })
            
        },

        onKeyDown(e, editor, next) {
            const {value} = editor

            // prevent backspace from merging body and link blocks with previous
            if (e.key === 'Backspace') {
                const { document, selection, startBlock} = value
                const {start, end} = selection

                if (startBlock && (startBlock.type === "body" || startBlock.type === "link") && start.offset === 0) {
                    const prevBlock = document.getPreviousBlock(start.key)
                    return editor.moveToEndOfNode(prevBlock);
                }
            }

            if (e.key === 'Enter') {
                const { document, selection, startBlock} = value
                const {start, end} = selection

                // when enter is pressed inside a link *block* (not inline), do nothing
                if (startBlock && startBlock.type === "link" && start.key === end.key) {
                    const nextBlock = document.getNextBlock(start.key)
                    if (nextBlock) {
                        return editor.moveToStartOfNode(nextBlock);
                    } else {
                        return editor.moveToEndOfNode(startBlock);
                    }
                }

                // when enter is pressed inside a body block, insert a void block
                if (startBlock && startBlock.type === "body" && start.key === end.key) {
                    const nextBlock = document.getNextBlock(start.key)
                    const prevBlock = document.getPreviousBlock(start.key)
                    const blockToInsert = Block.create({object: 'block', type: ''})

                    // Void block at the end of the document
                    if (!nextBlock) {
                        return editor
                        .moveToEndOfNode(startBlock)
                        .insertBlock(blockToInsert)
                        .moveToEnd()
                    }
                    // Void block between two blocks
                    if (nextBlock && prevBlock) {
                        return editor
                        .moveToEndOfNode(startBlock)
                        .insertBlock(blockToInsert)
                    }
                    // Void block in the beginning of the document
                    if (nextBlock && !prevBlock) {
                        return editor
                        .moveToStartOfNode(startBlock)
                        .insertNodeByKey(document.key, 0, blockToInsert)
                    }
                }
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