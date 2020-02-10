// import { Block } from 'slate';

export const schema = {
    blocks: {
        section: {
            parent: {object: "document"},
            normalize: (editor, error) => {                
                const parent_index = editor.value.document.nodes.indexOf(error.parent)
                // something weird is going on
                if (parent_index === -1) {
                    return
                }
                editor.moveNodeByKey(error.node.key, editor.value.document.key, parent_index + 1)
                return
            }
        }

        //     nodes: [
        //         // {
        //         //     match: {type: 'link'},
        //         //     min: 1,
        //         //     max: 1,
        //         // },
        //         // {
        //         //     match: {type: 'body'},
        //         //     min: 1,
        //         //     max: 1,
        //         // }
        //     ],
        //     normalize: (editor, error) => {
        //         switch (error.code) {
        //             case 'child_type_invalid':
        //                 if (error.child.object === "text") {
        //                     addMissing(editor, error, "link")
        //                 }
                        
        //                 return
                    
        //             case 'child_min_invalid':
        //                 var hasChildTypes = [];
        //                 error.node.nodes.forEach(node => {
        //                     hasChildTypes.push(node.type)
        //                 })
                        
        //                 if (!hasChildTypes.includes("link")) {
        //                     addMissing(editor, error, "link")
        //                 }

        //                 if (!hasChildTypes.includes("body")) {
        //                     addMissing(editor, error, "body")
        //                 }

        //                 return

        //             default:
        //                 console.log("unhandled err " + error);
                        
        //                 return
        //         }
        //     }
        // }
    }
}

// function addMissing(editor, error, nodeType) {
//     const node_id = error.node.data.get("node_id")
//     const graphNode = editor.getSharedState().getGraphNode(node_id)
//     const text = nodeType === "link" ? graphNode.getShortText() : graphNode.getLongText()
//     const index = nodeType === "link" ? 0 : 1

//     addBlock(editor, error.node, nodeType, index, node_id, text)
// }

// function addBlock(editor, parent, nodeType, index, id, text) {
//     var block = Block.create({
//         type: nodeType,
//         data: {node_id: id}
//     })
//     editor.insertNodeByKey(parent.key, index, block);
    
// }