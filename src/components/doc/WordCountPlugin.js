import React from 'react';

export default function WordCountPlugin(options) {
    return {
        renderEditor(props, editor, next) {
            const wordCount = countWords(props.editor.value.document)
            const children = next()

            return (
                <React.Fragment>
                    {children}
                    <span className="word-count">{wordCount + " words"}</span>
                </React.Fragment>
            )
        }
    }
}

function countWords(document) {
    if (!document) {
        return 0
    }

    // count words per block because document.text does not preserve newlines so undercounts
    var count = 0
    document.getBlocks().forEach(block => {
        // skip hidden body/link elements
        if (block.type === 'link' || block.type === 'body') {
            const parent = document.getParent(block.key)
            if (parent && parent.type === 'section') {
                if ((parent.data.get('nodeStyle') === 'Heading only' && block.type === 'body') ||
                    (parent.data.get('nodeStyle') === 'Body only' && block.type === 'link')) {
                    return
                }
            }
        }        

        const words = block.text.match(/\S+/g)  // split into non-whitespace substrings
        if (words) {
            count += words.length
        }
    })

    return count.toString()
}