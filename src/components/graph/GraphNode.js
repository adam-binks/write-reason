var ARROW_HITBOX_MARGIN = 20;

class GraphNode {
    constructor(nodes, mouse_follower, shared_state, text, x, y, width, height, focus_text_area) {
        this.id = shared_state.getNodeId();

        this.nodes = nodes;
        this.group = nodes.group().translate(x, y);

        var arrow_hitbox = this.group.rect(width + 2 * ARROW_HITBOX_MARGIN, height + 2 * ARROW_HITBOX_MARGIN)
            .translate(-ARROW_HITBOX_MARGIN, -ARROW_HITBOX_MARGIN).opacity(0);
        this.rect = this.group.rect(width, height).radius(10).addClass('node');
        this.text = this.group.text(text).addClass('node-text');

        this.setupRectDragging(this.rect, shared_state);
        this.setupArrowHitbox(arrow_hitbox, mouse_follower);
        this.rect.on('mouseup', (e) => {
            if (mouse_follower.drawing_arrow_from) {
                mouse_follower.complete_arrow(this);
            }
        });

        this.rect.on('mouseenter', (e) => {
            this.setHovered(true);
            var ref = shared_state.getDocNodeRef(this.id);
            if (ref) {
                ref.setExternalHover(true);
            }
        });
        this.rect.on('mouseleave', (e) => {
            this.setHovered(false);
            var ref = shared_state.getDocNodeRef(this.id);
            if (ref) {
                ref.setExternalHover(false);
            }
        });

        if (focus_text_area) {
            this.editText(shared_state, true);
        }
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
        rect.draggy(); // setup dragging on the rect
        rect.on('mousedown', (e) => {
            e.stopPropagation(); // don't pan when moving a node
        });
        rect.just_dropped = false;
        rect.on('dragstart', (e) => {
            var start_x = this.group.x();
            var start_y = this.group.y();
            document.activeElement.blur();

            shared_state.draggedNode = {
                id: this.id,
                text: this.text.text(),
                resetPos: () => {
                    this.group.move(start_x, start_y);
                },
                node: this
            };

            rect.off('dragmove');
            rect.on('dragmove', (e) => {
                this.group.move(start_x + e.detail.delta.movedX, start_y + e.detail.delta.movedY);
                rect.x(0);
                rect.y(0);
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
                    rect.just_dropped = true;
                    setTimeout(() => { rect.just_dropped = false }, 0.05);
                }

                shared_state.draggedNode = false;
            });
        });
        this.text.click((e) => e.preventDefault());
        var edit_text_if_not_just_dropped = () => { if (!rect.just_dropped) this.editText(shared_state) };
        rect.click(edit_text_if_not_just_dropped);
        this.text.click(edit_text_if_not_just_dropped);
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

    editText(shared_state, delete_if_empty_text = false) {
        document.activeElement.blur(); // remove focus from everything

        var textarea = document.querySelector('#nodeedit');
        textarea.value = this.text.text();

        var screen_coords = this.group.getScreenCoords();
        textarea.style.left = screen_coords.x + "px";
        textarea.style.top = screen_coords.y + "px";
        textarea.style.display = "inline-block";
        textarea.focus();

        var save_changes = () => {
            this.text.text(this.text.text().replace(/[\r\n\v]+/g, ''));
            this.text.text(textarea.value);
            
            shared_state.updateDocShortText(this.id, this.text.text());
        };
        var save_and_hide = () => {
            save_changes();
            textarea.style.display = "none";
            if (delete_if_empty_text && (!this.text.text() || this.text.text() === "")) {
                this.delete();
            }
        };
        textarea.onblur = save_and_hide;
        textarea.onkeydown = (e) => {
            save_changes();
            if (e.key === "Escape" || e.key === "Esc" || e.key === "Enter") {
                save_and_hide();
                e.preventDefault();
            }
        };
    }

    delete() {
        this.group.remove();
    }
}

export default GraphNode;