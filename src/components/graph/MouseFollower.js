const COMPLETED_ARROW_COLOUR = "#5D4037";
const POTENTIAL_ARROW_COLOUR = "#d4b8b0";
const DRAWING_ARROW_COLOUR = "#719deb";

class MouseFollower {
    constructor(parent_element, svg, connectables_container, markers, links) {
        this.drawing_arrow_from = false;
        this.connector = undefined;
        this.connectables_container = connectables_container;
        this.markers = markers;
        this.links = links;

        this.mouse_rect = svg.group();
        window.addEventListener('mousemove', e => {
            var point = svg.point(e.clientX, e.clientY);
            this.mouse_rect.move(point.x, point.y); //e.clientX - parent_element.getBoundingClientRect().left, e.clientY - parent_element.getBoundingClientRect().top);
            
            if (typeof(this.connector) !== 'undefined') {
                this.connector.update();
            }
        });

        // cancel arrows if they don't end on a node
        window.addEventListener('mouseup', (e) => {
            if (this.drawing_arrow_from) {
                e.preventDefault();
                this.stop_drawing_arrow();
            }
        });
    }

    update_source(new_source) {
        if (typeof(this.connector) === 'undefined') {
            this.connector = new_source.connectable({
                container: this.connectables_container,
                markers: this.markers
            }, this.mouse_rect);
        } else {
            this.connector.target = this.mouse_rect;
            this.connector.source = new_source;
            this.connector.update();
        }
        this.connector.setLineColor(POTENTIAL_ARROW_COLOUR);
    }

    hide() {
        if (typeof(this.connector) !== 'undefined') {
            this.connector.target = this.connector.source;
        }
    }

    start_arrow(source_node) {
        this.drawing_arrow_from = source_node;
        this.connector.setLineColor(DRAWING_ARROW_COLOUR);
    }

    complete_arrow(end_node) {
        this.drawing_arrow_from.group.connectable({
            container: this.links,
            markers: this.markers
        }, end_node.group).setLineColor(COMPLETED_ARROW_COLOUR);
        this.stop_drawing_arrow()
    }

    stop_drawing_arrow() {
        this.drawing_arrow_from = false;
        this.hide();
    }
}

export default MouseFollower;