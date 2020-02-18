import React from 'react';
import LinkNode from './nodes/LinkNode.js'
import BodyNode from './nodes/BodyNode.js'
import SectionNode from './nodes/SectionNode.js'
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
            var refAndId;
            if (props.node.type === 'body') {
                refAndId = getRefAndId(props, editor, "long");

                // set up the placeholder text to only appear when the body is empty and no text is selected
                var isEmpty = (!props.node.text || props.node.text === "");

                var selectNode = () => {
                    setTimeout(() => {editor.focus(); editor.moveToStartOfNode(props.node);}, 0)
                }

                return <BodyNode ref={refAndId.ref} {...props} sharedState={editor.getSharedState()} nodeId={refAndId.id} isEmpty={isEmpty} selectNode={selectNode}/>

            } else if (props.node.type === 'link') {
                refAndId = getRefAndId(props, editor, "short");

                return <LinkNode ref={refAndId.ref} {...props} linkStyle="heading" sharedState={editor.getSharedState()} nodeId={refAndId.id}/>

            } else if (props.node.type === 'section') {
                refAndId = getRefAndId(props, editor, "section");

                return <SectionNode ref={refAndId.ref} {...props} sharedState={editor.getSharedState()} nodeId={refAndId.id}/>
            }

            return next();
        },

        onDrop(event, editor, next) {
            // suppress drop events
            // next();
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
                const {start} = selection

                if (startBlock && (startBlock.type === "body" || startBlock.type === "link") && start.offset === 0) {
                    const prevBlock = document.getPreviousBlock(start.key)
                    if (prevBlock) {
                        editor.moveToEndOfNode(prevBlock);
                    }
                    return editor
                }
            }
            
            // if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            //     const start = value.selection.start
            //     const adjacentBlock = e.key === 'ArrowDown' ? value.document.getNextBlock(start.key) : value.document.getPreviousBlock(start.key)
            //     const closestFunc = e.key === 'ArrowDown' ? editor.moveToStartOfNode : editor.moveToEndOfNode
            //     const furthestFunc = e.key === 'ArrowDown' ?  editor.moveToEndOfNode : editor.moveToStartOfNode
                
            //     console.log("x");

            //     if (adjacentBlock) {
            //         console.log("adj");
                    
            //         return editor.moveToStartOfNode(adjacentBlock);
            //     } else if (value.startBlock) {
            //         return editor.moveToStartOfNode(value.startBlock);
            //     }
            // }

            if (e.key === 'Enter') {
                const { document, selection, startBlock} = value
                const {start, end} = selection

                var isInLinkInline = false;
                value.inlines.forEach((inline) => {
                    if (inline.type === "link") {
                        isInLinkInline = true;
                    }
                })
                if (isInLinkInline) {
                    return; // do nothing to avoid splitting the link
                }

                // when enter is pressed inside a link *block* (not inline), just go to body
                if (startBlock && startBlock.type === "link" && start.key === end.key) {
                    const nextBlock = document.getNextBlock(start.key)
                    if (nextBlock) {
                        return editor.moveToStartOfNode(nextBlock);
                    } else {
                        return editor.moveToEndOfNode(startBlock);
                    }
                }

                // when enter is pressed inside a body block, insert a block after the section
                if (startBlock && startBlock.type === "body" && start.key === end.key) {
                    const blockToInsert = Block.create({object: 'block', type: ''})
                    const section = document.getParent(startBlock.key);
                    const sectionParent = document.getParent(section.key);                    
                    const sectionIndex = sectionParent.nodes.indexOf(section);

                    editor.insertNodeByKey(sectionParent.key, sectionIndex + 1, blockToInsert);
                    return editor.moveToEndOfNode(startBlock).moveForward(1)
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