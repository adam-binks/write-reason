import { Block } from 'slate';
import OptionPopup from '../graph/OptionPopup.js'
import { insertSectionBlock } from './GraphPlugin.js';

export const showNodeSwitchMenu = (event, state, setState, node, editor) => {
    const entries = [
        {'colour': 'black', 'name': 'Heading only', 'symbol': "▔"},
        {'colour': 'black', 'name': 'Body only', 'symbol': "▂"},
        {'colour': 'black', 'name': 'Heading and body', 'symbol': "▤"},
        {'colour': 'black', 'name': 'Inline', 'symbol': "⌶"},
        {'colour': 'red', 'name': 'Delete', 'symbol': "🗙"}
    ]

    event.preventDefault();

    const onOptionSelect = (selectedEntry) => {
        const selected = selectedEntry.name
        if (selected === "Delete") {
            editor.getSharedState().logger.logEvent({
                type: "doc_node_delete",
                id: node.data.get("node_id")
            });
            deleteNode(node, editor);
        } else {
            editor.getSharedState().logger.logEvent({
                type: "doc_node_change_format",
                old: state.nodeStyle,
                new: selected,
                id: node.data.get("node_id")
            });

            if (state.nodeStyle !== "Inline" && selected !== "Inline") {
                setState({nodeStyle: selected})
            } else if (state.nodeStyle === "Inline" && selected !== "Inline") {
                convertFromInline(node, editor, selected)
            }  else if (state.nodeStyle !== "Inline" && selected === "Inline") {
                convertToInline(node, editor)
            }
        }
    }

    new OptionPopup(entries, event.clientX, event.clientY, true, onOptionSelect, state.nodeStyle, document.querySelector(".App"))
}

function deleteNode(node, editor) {
    editor.getSharedState().removeDocNode(node.data.get("node_id"))

    editor.removeNodeByKey(node.key)
}

function convertFromInline(node, editor, newStyle) {
    editor.moveToRangeOfNode(node);
    const parent = editor.value.document.getParent(node.key)
    if (parent && parent.text === node.text) {
        editor.moveToRangeOfNode(parent)
    }
    insertSectionBlock(editor, node.data.get("node_id"), node.text, "")
}

function convertToInline(node, editor) {
    const shortText = node.getBlocksByType("link").get(0).text;
    // need to get 0th child because previous of section is the body inside it
    const prev = editor.value.document.getPreviousBlock(node.nodes.get(0).key)
    const next = editor.value.document.getNextBlock(node.nodes.get(1).key)

    const getEmptyParagraph = () => Block.create({
        type: 'paragraph'
    })

    // if doc only contains this section, add an empty paragraph at the start to prevent emptying the doc
    if (!prev && !next) {
        editor.insertNodeByKey(editor.value.document.key, 0, getEmptyParagraph())
    }

    editor.moveToRangeOfNode(node)

    // don't merge with prev block if prev is another section - wrap it in a fresh paragraph instead
    if (prev && (prev.type === "section" || prev.type === "body")) {
        editor.wrapBlockByKey(node.key, "paragraph")
        editor.removeNodeByKey(node.key)
        editor.moveForward()
    } else {
        editor.removeNodeByKey(node.key)
    }

    editor.insertInline({
            type: "link",
            data: {node_id: node.data.get("node_id")}
        })
        .insertText(shortText)
}

export const getNodeStyleClass = (verbose) => {
    switch (verbose) {
        case "Heading only":
            return " hide-body"

        case "Body only":
            return " hide-heading"
    
        default:
            return "";
    }
}