import OptionPopup from './OptionPopup.js'

const COMPLETED_ARROW_COLOUR = "#5D4037";
const POTENTIAL_ARROW_COLOUR = "#d4b8b0";
const DRAWING_ARROW_COLOUR = "#719deb";

const ARROW_OPTIONS = [
    {'colour': 'green', 'name': 'Supports', 'symbol': "→"},
    {'colour': 'red', 'name': 'Opposes', 'symbol': "→"},
    {'colour': 'blue', 'name': 'Expands', 'symbol': "→"},
    {'colour': 'red', 'name': 'Delete', 'symbol': "🗙"}
];

class MouseFollower {
    constructor(shared_state, svg, connectables_container, markers, links) {
        this.shared_state = shared_state;
        this.drawing_arrow_from = false;
        this.connector = undefined;
        this.connectables_container = connectables_container;
        this.markers = markers;
        this.links = links;

        this.mouse_rect = svg.group();
        window.addEventListener('mousemove', e => {
            var point = svg.point(e.clientX, e.clientY);
            this.mouse_rect.move(point.x, point.y);
            
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
            this.connector.marker.show();
            this.connector.line.show();

            this.connector.target = this.mouse_rect;
            this.connector.source = new_source;
            this.connector.update();
        }
        if (this.connector) {
            this.connector.setLineColor(POTENTIAL_ARROW_COLOUR);
        }
    }

    hide() {
        if (typeof(this.connector) !== 'undefined') {
            this.connector.target = this.connector.source;
            this.connector.marker.hide();
            this.connector.line.hide();
        }
    }

    start_arrow(source_node) {
        this.drawing_arrow_from = source_node;
        if (this.connector) {
            this.connector.setLineColor(DRAWING_ARROW_COLOUR);
        }
    }

    complete_arrow(end_node) {
        // no arrows to self
        if (end_node === this.drawing_arrow_from) {
            this.stop_drawing_arrow();
            return;
        }

        var connector = this.drawing_arrow_from.group.connectable({
            container: this.links,
            markers: this.markers,
            specialCoords: true
        }, end_node.group);
        connector.setLineColor(COMPLETED_ARROW_COLOUR);

        const show_context_menu = e => {
            var graph_pos = document.getElementById("graph").getBoundingClientRect();
            this.edit_connector_type(connector, e.clientX - graph_pos.left, e.clientY - graph_pos.top, true);
            e.preventDefault();
        };
        connector.line.on("click", show_context_menu);
        connector.line.on("contextmenu", show_context_menu);

        var c1 = this.drawing_arrow_from.group.getScreenCoords();
        var c2 = end_node.group.getScreenCoords();
        var midpoint = [(c1.x + c2.x) / 2, (c1.y + c2.y) / 2]

        this.edit_connector_type(connector, midpoint[0], midpoint[1], false);

        this.shared_state.logger.logEvent({'type': 'arrow_create', 'id': connector.id, 'source': this.drawing_arrow_from.id, 'target': end_node.id});
        this.stop_drawing_arrow();
    }

    edit_connector_type(connector, popup_x, popup_y, hideOnClickOutside) {
        var prev_selected = undefined;
        
        ARROW_OPTIONS.forEach(entry => {
            if (entry.colour === connector.line.attr('stroke')) {
                prev_selected = entry.name;
            }
        })

        new OptionPopup(ARROW_OPTIONS, popup_x, popup_y, hideOnClickOutside, (selected_option) => {
            if (selected_option.name === "Delete") {
                this.shared_state.logger.logEvent({'type': 'arrow_delete', 'id': connector.id});
                this.remove_arrow(connector);
            } else {
                connector.setLineColor(selected_option.colour);
                this.shared_state.logger.logEvent({'type': 'arrow_set_type', 'id': connector.id, 'new_type': selected_option.name});
            }
        }, prev_selected);
    }

    remove_arrow(connector) {
        connector.line.node.instance.delete_connectable(connector);
    }

    stop_drawing_arrow() {
        this.drawing_arrow_from = false;
        this.hide();
    }
}

export default MouseFollower;