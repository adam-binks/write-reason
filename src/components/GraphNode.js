var ARROW_HITBOX_MARGIN = 20;

class GraphNode {
    constructor(nodes, mouse_follower, text, x, y, width, height) {
        this.group = nodes.group().translate(x, y);

        var arrow_hitbox = this.group.rect(width + 2 * ARROW_HITBOX_MARGIN, height + 2 * ARROW_HITBOX_MARGIN)
            .translate(-ARROW_HITBOX_MARGIN, -ARROW_HITBOX_MARGIN).opacity(0);
        var rect = this.group.rect(width, height).radius(10).addClass('node');
        this.text = this.group.text(text).addClass('node-text');
        
        this.setup_arrow_hitbox(arrow_hitbox, rect, mouse_follower);
        rect.on('mouseup', (e) => {
            if (mouse_follower.drawing_arrow_from) {
                mouse_follower.complete_arrow(this);
            }
        });

        this.edit_text();
    }

    // the hitbox for arrows is an invisible rect a bit bigger than the visible node rect
    // but we only want to make the node itself draggable
    // so we need to intercept drag events on the rect, and move the entire group instead!
    // meanwhile, click/drag events on the arrow hitbox should start the arrow creation process
    setup_arrow_hitbox(arrow_hitbox, rect, mouse_follower) {
        rect.draggy(); // setup dragging on the rect
        rect.on('mousedown', (e) => {
            e.stopPropagation(); // don't pan when moving a node
        });
        rect.on('dragstart', (e) => {
            var start_x = this.group.x();
            var start_y = this.group.y();
            rect.on('dragmove', (e) => {
                this.group.move(start_x + e.detail.delta.movedX, start_y + e.detail.delta.movedY);
                rect.x(0);
                rect.y(0);
                this.group.node.dispatchEvent(new CustomEvent("dragmove")); // update any connectables looking for drag events
            });
        });
        rect.click(() => this.edit_text());
        arrow_hitbox.on('mousemove', ()  => {
            if (!mouse_follower.drawing_arrow_from) {
                mouse_follower.update_source(this.group);
            }
        });
        arrow_hitbox.on('mouseleave', ()  => {
            if (!mouse_follower.drawing_arrow_from) {
                mouse_follower.hide();
            }
        });
        arrow_hitbox.on('mousedown', (e) => {
            mouse_follower.start_arrow(this);
            e.stopPropagation(); // don't pan when dragging an arrow
        });
    }

    edit_text() {
        document.activeElement.blur(); // remove focus from everything

        var textarea = document.querySelector('#nodeedit');
        textarea.value = this.text.text();

        var point = this.group.point(0, 0);
        textarea.style.left = this.group.x() + "px";
        textarea.style.top = this.group.y() + "px";
        textarea.style.display = "inline-block";
        textarea.focus();

        var save_changes = ()  => {
            this.text.text(textarea.value);
        };
        var save_and_hide = ()  => {
            save_changes();
            textarea.style.display = "none";
        };
        textarea.onblur = save_and_hide;
        textarea.onkeyup = (e) =>  {
            save_changes();
            if (e.key === "Escape" || e.key === "Esc" || e.key === "Enter") {
                save_and_hide();
            }
        };
    }
}

export default GraphNode;