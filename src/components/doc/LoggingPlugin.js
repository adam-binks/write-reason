
import { getEventTransfer } from 'slate-react';

export default function LinkPlugin(options) {
    return {
        onCopy(event, editor, next) {
            editor.getSharedState().logger.logEvent({
                type: "copy",
                content: editor.value.fragment.text
            });
            
            next();
        },

        onCut(event, editor, next) {
            editor.getSharedState().logger.logEvent({
                type: "cut",
                content: editor.value.fragment.text
            });
            
            next();
        },

        onPaste(event, editor, next) {
            var transfer = getEventTransfer(event);

            editor.getSharedState().logger.logEvent({
                type: "paste",
                paste_type: transfer.type,
                content: transfer.fragment ? transfer.fragment.text : "",
                content_html: transfer.fragment ? "" : transfer.html  // only include if there is no fragment (pasted from external)
            });
            
            next();
        },
    }
}