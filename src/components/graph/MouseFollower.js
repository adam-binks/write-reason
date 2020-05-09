import OptionPopup from './OptionPopup.js'
import { toast } from 'react-toastify';

const COMPLETED_ARROW_COLOUR = "#5D4037";
const POTENTIAL_ARROW_COLOUR = "#d4b8b0";
const DRAWING_ARROW_COLOUR = "#719deb";

const ARROW_OPTIONS = [
    {'colour': 'green', 'name': 'Supports', 'symbol': "→"},
    {'colour': 'red', 'name': 'Opposes', 'symbol': "→"},
    {'colour': 'blue', 'name': 'Expands', 'symbol': "→"},
    {'colour': 'red', 'name': 'Delete', 'symbol': "🗙"}
];

export default class MouseFollower {
    constructor(shared_state, svg, connectables_container, markers, links) {
        this.shared_state = shared_state;
        this.drawing_arrow_from = false;
        this.connector = undefined;
        this.connectables_container = connectables_container;
        this.markers = markers;
        this.links = links;

        this.arrow_id_counter = 0

        this.completed_arrows = []

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

    toJSON() {
        return {
            arrows: this.completed_arrows,
            arrow_id_counter: this.arrow_id_counter,
        }
    }

    static fromJSON(json, shared_state, svg, connectables_container, markers, links) {
        var mf = new MouseFollower(shared_state, svg, connectables_container, markers, links)
        mf.arrow_id_counter = json && json.arrow_id_counter ? json.arrow_id_counter : 0
        mf.completed_arrows = json && json.arrows ? json.arrows : []

        return mf
    }

    // draw all the arrows in this.completed_arrows
    // needs to happen separately from loading because when the mouse_follower is first created, the nodes have not yet been loaded
    draw_loaded_arrows(get_node) {
        this.completed_arrows.forEach(arrow => {
            const originNode = get_node(arrow.origin)
            const destinationNode = get_node(arrow.destination)

            if (!originNode) {
                toast.error("Error: could not draw arrow from origin " + arrow.origin)
                return
            }

            if (!destinationNode) {
                toast.error("Error: could not draw arrow to destination " + arrow.destination)
                return
            }

            const connector = this.draw_arrow(
                originNode,
                destinationNode,
                arrow.colour
            )
            this.add_context_menu_to_arrow(connector, arrow)
        })
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

    draw_arrow(origin, destination, colour) {
        var connector = origin.group.connectable({
            container: this.links,
            markers: this.markers,
            specialCoords: true
        }, destination.group);
        connector.setLineColor(colour);

        connector.source.on("deletenode", () => {
            connector.source.node.instance.delete_connectable(connector)
            this.remove_arrow(connector)
        });
        connector.target.on("deletenode", () => {
            connector.target.node.instance.delete_connectable(connector)
            this.remove_arrow(connector)
        });

        return connector
    }

    add_context_menu_to_arrow(connector, arrowObject) {
        const show_context_menu = e => {
            var graph_pos = document.getElementById("graph").getBoundingClientRect();
            this.edit_connector_type(connector, e.clientX - graph_pos.left, e.clientY - graph_pos.top, true, (new_colour) => {
                arrowObject.colour = new_colour
            }, arrowObject);
            e.preventDefault();
        };
        connector.line.on("click", show_context_menu);
        connector.line.on("contextmenu", show_context_menu);

        connector.source.on("deletenode", () => {
            connector.source.node.instance.delete_connectable(connector)
            this.remove_arrow(connector, arrowObject)
        });
        connector.target.on("deletenode", () => {
            connector.target.node.instance.delete_connectable(connector)
            this.remove_arrow(connector, arrowObject)
        });
    }

    complete_arrow(end_node) {
        // no arrows to self
        if (end_node === this.drawing_arrow_from) {
            this.stop_drawing_arrow();
            return;
        }

        var connector = this.draw_arrow(this.drawing_arrow_from, end_node, COMPLETED_ARROW_COLOUR)

        var c1 = this.drawing_arrow_from.group.getScreenCoords();
        var c2 = end_node.group.getScreenCoords();
        var midpoint = [(c1.x + c2.x) / 2, (c1.y + c2.y) / 2]

        // only add the arrow to the list of completed arrows once a colour is selected
        // to prevent weird states being saved and loaded
        const drawing_arrow_from_id = this.drawing_arrow_from.id
        const colourWasSelected = (colour) => {
            const id = this.getNewId()
            const arrowObject = {
                id: id,
                origin: drawing_arrow_from_id,
                destination: end_node.id,
                colour: colour,
            }
            this.completed_arrows.push(arrowObject)

            this.add_context_menu_to_arrow(connector, arrowObject)
        }

        this.edit_connector_type(connector, midpoint[0], midpoint[1], false, colourWasSelected);

        this.shared_state.logger.logEvent({'type': 'arrow_create', 'id': connector.id, 'source': this.drawing_arrow_from.id, 'target': end_node.id});
        this.stop_drawing_arrow();
    }

    getArrowByID(id) {
        return this.completed_arrows.find(arrow => arrow.id === id)
    }

    getNewId() {
        this.arrow_id_counter++
        return this.arrow_id_counter
    }

    edit_connector_type(connector, popup_x, popup_y, hideOnClickOutside, onColourSelected, arrowObject) {
        var prev_selected = undefined;
        
        ARROW_OPTIONS.forEach(entry => {
            if (entry.colour === connector.line.attr('stroke')) {
                prev_selected = entry.name;
            }
        })

        new OptionPopup(ARROW_OPTIONS, popup_x, popup_y, hideOnClickOutside, (selected_option) => {
            if (selected_option.name === "Delete") {
                this.shared_state.logger.logEvent({'type': 'arrow_delete', 'id': connector.id});
                this.remove_arrow(connector, arrowObject);
            } else {
                connector.setLineColor(selected_option.colour);
                this.shared_state.logger.logEvent({'type': 'arrow_set_type', 'id': connector.id, 'new_type': selected_option.name});

                if (onColourSelected) {
                    onColourSelected(selected_option.colour)
                }
            }
        }, prev_selected);
    }

    remove_arrow(connector, arrowObject) {
        connector.line.node.instance.delete_connectable(connector);

        if (arrowObject) {
            this.completed_arrows = this.completed_arrows.filter(arrow => arrow !== arrowObject)        
        }
    }

    stop_drawing_arrow() {
        this.drawing_arrow_from = false;
        this.hide();
    }
}