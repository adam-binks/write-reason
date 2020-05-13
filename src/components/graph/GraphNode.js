import OptionPopup from "./OptionPopup";

var ARROW_HITBOX_MARGIN = 20;

class GraphNode {
    constructor(params, nodes, mouse_follower, shared_state, focus_text_area, getNodesList) {
        var { shortText, x, y, width, height, id, isOnGraph, longText } = params
        this.id = id ? id : shared_state.getNodeId();

        this.getNodesList = getNodesList;
        
        this.group = nodes.group().translate(x, y);

        this.dropShadow = this.group.rect(width, height).radius(5).addClass('node-drop-shadow')
        this.arrow_hitbox = this.group.rect(width + 2 * ARROW_HITBOX_MARGIN, height + 2 * ARROW_HITBOX_MARGIN)
            .translate(-ARROW_HITBOX_MARGIN, -ARROW_HITBOX_MARGIN).opacity(0).addClass('arrow-hitbox');
        
        this.rect = this.group.rect(width, height).radius(5).addClass('node');
        this.text = this.group.text("").addClass('node-text');
        this.updateShortText(shortText)
        this.updateLongText(longText)

        this.setupRectDragging(this.rect, shared_state);
        this.setupArrowHitbox(this.arrow_hitbox, mouse_follower);
        const complete_arrow = (e) => {
            if (mouse_follower.drawing_arrow_from) {
                mouse_follower.complete_arrow(this);
            }
        };
        this.arrow_hitbox.on('mouseup', complete_arrow);
        this.rect.on('mouseup', complete_arrow);
        this.text.on('mouseup', complete_arrow);

        this.setupHover(shared_state);
        this.setupContextMenu(shared_state);

        if (focus_text_area) {
            this.editText(shared_state, !params.doNotDeleteIfEmptyText);
        }
        
        this.setIsOnGraph(isOnGraph);

        // don't log add node events if they are just loaded from a save
        if (!params.isFromJSON) {
            shared_state.logger.logEvent({'type': 'node_create', 'id': this.id});
        }
    }

    static fromJSON(json, nodes, mouse_follower, shared_state, getNodesList) {
        var params = json
        params.x = json.screenCoords.x
        params.y = json.screenCoords.y
        params.width = 200
        params.height = 42
        params.isFromJSON = true
        return new GraphNode(params, nodes, mouse_follower, shared_state, false, getNodesList)
    }

    toJSON() {
        return {
            id: this.id,
            shortText: this.shortText,
            longText: this.longText,
            screenCoords: this.group.getScreenCoords(),
            isOnGraph: this.isOnGraph,
        }
    }

    setIsOnGraph(newVal) {
        this.isOnGraph = newVal;
        if (this.isOnGraph) {
            this.rect.addClass("node-on-graph");
        } else {
            this.rect.removeClass("node-on-graph");
        }
    }

    setupContextMenu(shared_state) {
        var showOptionMenu = e => {
            e.preventDefault();
            
            var entries = [
                {'colour': 'red', 'name': 'Delete', 'symbol': "🗙"}
            ]
            var graph_pos = document.getElementById("graph").getBoundingClientRect();
            new OptionPopup(entries, e.clientX - graph_pos.left, e.clientY - graph_pos.top, true, (selected_option) => {
                if (selected_option.name === "Delete") {
                    this.delete(shared_state);
                }
            });
            
            return false;
        };
        this.rect.on('contextmenu', showOptionMenu);
        this.text.on('contextmenu', showOptionMenu);
    }

    setupHover(shared_state) {
        this.hoverers = []

        const startHover = (e) => {
            this.setHoverer("mouse_" + e.target, true);
            shared_state.getAllDocNodeRefs(this.id).forEach(ref => {
                if (!ref) {
                    return
                }
                ref.decoratedRef ? ref.decoratedRef.current.decoratedRef.current.setExternalHover(true) : ref.setExternalHover(true);
            });
        };
        const endHover = (e) => {
            this.setHoverer("mouse_" + e.target, false);
            shared_state.getAllDocNodeRefs(this.id).forEach(ref => {
                if (!ref) {
                    return
                }
                ref.decoratedRef ? ref.decoratedRef.current.decoratedRef.current.setExternalHover(false) : ref.setExternalHover(false);
            });
        };
        this.rect.on('mouseenter', startHover);
        this.text.on('mouseenter', startHover);
        this.rect.on('mouseleave', endHover);
        this.text.on('mouseleave', endHover);
    }

    setHoverer(hoverer, isHovering) {
        if (isHovering) {
            if (!this.hoverers.includes(hoverer)) {
                this.hoverers.push(hoverer)
            }
        } else {
            // remove the hoverer
            var index = this.hoverers.indexOf(hoverer);
            if (index !== -1) this.hoverers.splice(index, 1);
        }

        this.setHovered(this.hoverers.length > 0)
    }

    setHovered(isHovered) {        
        if (isHovered) {
            this.rect.addClass("hovered");
        } else {
            this.rect.removeClass("hovered");
        }
    }

    // the hitbox for arrows is an invisible rect a bit bigger than the visible node rect
    // but we only want to make the node itself draggable
    // so we need to intercept drag events on the rect, and move the entire group instead!
    setupRectDragging(rect, shared_state) {
        this.setupGroupDragging(rect, shared_state, rect);
        this.setupGroupDragging(this.text, shared_state, rect, true);
        
        this.text.click((e) => e.preventDefault());
        var edit_text_if_not_just_dropped = () => { if (!rect.just_dropped) this.editText(shared_state) };
        rect.click(edit_text_if_not_just_dropped);
        this.text.click(edit_text_if_not_just_dropped);
    }

    setupGroupDragging(rect, shared_state, just_dropped_obj, center=false) {
        rect.draggy(); // setup dragging on the rect
        rect.on('mousedown', (e) => {
            e.stopPropagation(); // don't pan when moving a node
        });
        just_dropped_obj.just_dropped = false;
        rect.on('dragstart', (e) => {
            var start_x = this.group.x();
            var start_y = this.group.y();
            document.activeElement.blur();
            shared_state.draggedNode = {
                id: this.id,
                text: this.getShortText(),
                longText: this.getLongText(),
                resetPos: () => {
                    this.group.move(start_x, start_y);
                    this.group.node.dispatchEvent(new CustomEvent("dragmove")); // update any connectables looking for drag events
                },
                node: this
            };

            this.dropShadow.translate(5, 5)
            this.dropShadow.addClass('visible')
            
            rect.off('dragmove');
            rect.on('dragmove', (e) => {
                this.group.move(start_x + e.detail.delta.movedX, start_y + e.detail.delta.movedY);
                if (center) {
                    this.text.center(0.5 * this.rect.width(), 0.5 * this.rect.height());
                } else {
                    rect.x(0);
                    rect.y(0);
                }
                this.group.node.dispatchEvent(new CustomEvent("dragmove")); // update any connectables looking for drag events
            });
            rect.off('dragend');
            rect.on('dragend', (e) => {
                // prevent the textarea showing
                // unless the drag amount was zero or just a tiny accidental drag
                var x_diff = (this.group.x() - start_x);
                var y_diff = (this.group.y() - start_y);
                var nudge = 10;
                if (x_diff > nudge || x_diff < -nudge || y_diff > nudge || y_diff < -nudge) {
                    just_dropped_obj.just_dropped = true;
                    setTimeout(() => { just_dropped_obj.just_dropped = false; }, 0.05);
                }
                shared_state.draggedNode = false;

                this.dropShadow.translate(0, 0)
                this.dropShadow.removeClass('visible')
            });
        });
    }

    // click/drag events on the arrow hitbox should start the arrow creation process
    setupArrowHitbox(arrow_hitbox, mouse_follower) {
        arrow_hitbox.on('mousemove', () => {
            if (!mouse_follower.drawing_arrow_from) {
                mouse_follower.update_source(this.group);
            }
        });
        arrow_hitbox.on('mouseleave', () => {
            if (!mouse_follower.drawing_arrow_from) {
                mouse_follower.hide();
            }
        });
        arrow_hitbox.on('mousedown', (e) => {
            mouse_follower.start_arrow(this);
            e.stopPropagation(); // don't pan when dragging an arrow
        });
    }

    updateShortText(newShortText) {
        this.shortText = newShortText.replace(/[\r\n\v]+/g, '');
        
        const CHARS_PER_LINE = 21;
        var formattedText = this.splitIntoLines(CHARS_PER_LINE, this.shortText);

        this.text.text(formattedText.join("\n"));
        this.resizeRect(formattedText.length);
    }

    updateLongText(newLongText) {
        this.longText = newLongText;
    }

    splitIntoLines(charsPerLine, text) {
        var formattedText = [];
        var line = "";
        text.split(" ").forEach(word => {
            var segments = [];
            if (word.length > charsPerLine) {
                for (let i = 0; i < word.length; i += charsPerLine - 1) {
                    if (segments.length > 0) {
                        segments[segments.length - 1] += "-"; // append a '-' onto the end of unfinished strings
                    }
                    segments.push(word.substring(i, Math.min(i + charsPerLine, word.length)));
                }
            }
            else {
                segments = [word];
            }
            segments.forEach(segment => {
                if ((line + segment).length < charsPerLine) {
                    var space = line.length > 0 ? " " : "";
                    line += space + segment;
                }
                else {
                    formattedText.push(line);
                    line = segment;
                }
            });
        });
        formattedText.push(line);
        return formattedText;
    }

    // resize the rect so that the text fits on it
    resizeRect(numLinesOfText) {
        this.rect.width(200);
        const rectHeight = numLinesOfText * 21 + 20
        this.rect.height(rectHeight);
        this.text.center(0.5 * this.rect.width(), 0.5 * this.rect.height());
        this.dropShadow.height(rectHeight)

        this.arrow_hitbox.size(this.rect.width() + ARROW_HITBOX_MARGIN * 2, this.rect.height() + ARROW_HITBOX_MARGIN * 2);

        this.group.node.dispatchEvent(new CustomEvent("dragmove")); // update any connectables looking for drag events
    }

    getShortText() {
        return this.shortText;
    }

    getLongText() {
        return this.longText;
    }

    editText(shared_state, delete_if_empty_text = false) {
        document.activeElement.blur(); // remove focus from everything

        var textarea = document.querySelector('#nodeedit');
        textarea.value = this.getShortText();

        const preEditText = this.getShortText()

        var screen_coords = this.group.getScreenCoords();
        textarea.style.left = screen_coords.x + "px";
        textarea.style.top = screen_coords.y + "px";
        textarea.style.display = "inline-block";
        textarea.focus();

        textarea.style.width = "180px";
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';

        this.text.hide();

        var save_changes = () => {
            this.updateShortText(textarea.value);
            shared_state.updateDocShortText(this.id, this.getShortText());
        };
        var save_and_hide = () => {
            save_changes();
            textarea.style.display = "none";
            if (delete_if_empty_text && (!this.text.text() || this.text.text() === "")) {
                this.delete(shared_state);
            }
            this.text.show();
            this.updateShortText(this.shortText);

            if (this.getShortText() !== preEditText) {
                shared_state.logger.logEvent({'type': 'node_edit_short_text', 'id': this.id, 'text': this.shortText});
            }
        };
        textarea.onblur = save_and_hide;
        textarea.onkeyup = (e) => {
            if (e.key === "Escape" || e.key === "Esc" || e.key === "Enter") {
                e.preventDefault();
                document.activeElement.blur();
            } else {
                save_changes();
            }
        };
    }

    delete(shared_state) {
        shared_state.removeGraphNode(this.id);
        
        // remove from the list of nodes (used for saving)
        const nodesList = this.getNodesList()
        var index = nodesList.indexOf(this);
        if (index !== -1) {
            nodesList.splice(index, 1)
        } else {
            console.log('node not found in this.nodesList when deleting');
        }        

        this.group.remove();

        // delete arrows
        this.group.node.dispatchEvent(new CustomEvent("deletenode"));

        shared_state.logger.logEvent({'type': 'node_delete', 'id': this.id});
    }
}

export default GraphNode;