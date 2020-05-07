import { Block } from 'slate';
import OptionPopup from '../graph/OptionPopup.js'
import { insertSectionBlock } from './GraphPlugin.js';

export const showNodeSwitchMenu = (event, node, editor, entriesToHide) => {
    var entries = [
        {'colour': 'black', 'name': 'Inline', 'symbol': "⌶"},
        {'colour': 'black', 'name': 'Heading and body', 'symbol': "▤"},
        {'colour': 'black', 'name': 'Heading only', 'symbol': "▔"},
        {'colour': 'black', 'name': 'Body only', 'symbol': "▂"},
        {'colour': 'red', 'name': 'Delete', 'symbol': "🗙"}
    ]

    if (entriesToHide) {
        entries = entries.filter((entry) => {return !entriesToHide.includes(entry.name)})
    }

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
            var nodeStyle = node.data.get("nodeStyle")
            if (!nodeStyle) {
                nodeStyle = "Inline"
            }

            editor.getSharedState().logger.logEvent({
                type: "doc_node_change_format",
                old: nodeStyle,
                new: selected,
                id: node.data.get("node_id")
            });

            if (nodeStyle !== "Inline" && selected !== "Inline") {
                editor.setNodeByKey(node.key, { data: {node_id: node.data.get("node_id"), nodeStyle: selected} })
            } else if (nodeStyle === "Inline" && selected !== "Inline") {
                convertFromInline(node, editor, selected)
            }  else if (nodeStyle !== "Inline" && selected === "Inline") {
                convertToInline(node, editor, selected)
            }
        }
    }

    new OptionPopup(entries, event.clientX, event.clientY, true, onOptionSelect, node.data.get('nodeStyle'), document.querySelector(".App"))
}

export function deleteNode(node, editor) {
    editor.getSharedState().removeDocNode(node.data.get("node_id"))

    editor.removeNodeByKey(node.key)
}

function convertFromInline(node, editor, newStyle) {
    editor.moveToRangeOfNode(node);
    const parent = editor.value.document.getParent(node.key)
    if (parent && parent.text === node.text) {
        editor.moveToRangeOfNode(parent)
    }
    insertSectionBlock(editor, node.data.get("node_id"), node.text, "", newStyle)    
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
    if ((prev && (prev.type === "section" || prev.type === "body")) || (!prev && next && (next.type === "section" || next.type === "link"))) {
        editor.wrapBlockByKey(node.key, "paragraph")
        editor.removeNodeByKey(node.key)
    } else {
        editor.removeNodeByKey(node.key)
    }

    editor.insertInline({
            type: "link",
            data: {node_id: node.data.get("node_id"), nodeStyle: "Inline"},
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