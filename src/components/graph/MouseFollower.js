import OptionPopup from './OptionPopup.js'
import { toast } from 'react-toastify';

const COMPLETED_ARROW_COLOUR = "#5D4037";
const POTENTIAL_ARROW_COLOUR = "#d4b8b0";
const DRAWING_ARROW_COLOUR = "#719deb";

const ADD_ARROW_TYPE_MENU_ITEM = 'Add arrow type'

const COLOURS = [
    'red',
    'goldenrod',
    'green',
    'aqua',
    'blue',
    'fuchsia',
    'purple',
    'saddlebrown'
]

var DEFAULT_ARROW_OPTIONS = [
    {'colour': 'green', 'name': 'Supports', 'symbol': "→"},
    {'colour': 'red', 'name': 'Opposes', 'symbol': "→"},
    {'colour': 'blue', 'name': 'Expands', 'symbol': "→"},
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
            arrowOptions: this.arrowOptions,
        }
    }

    static fromJSON(json, shared_state, svg, connectables_container, markers, links) {
        var mf = new MouseFollower(shared_state, svg, connectables_container, markers, links)
        mf.arrow_id_counter = json && json.arrow_id_counter ? json.arrow_id_counter : 0
        mf.completed_arrows = json && json.arrows ? json.arrows : []
        mf.arrowOptions = json && json.arrowOptions ? json.arrowOptions : DEFAULT_ARROW_OPTIONS

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
            
            // update the arrow start and end points
            originNode.group.node.dispatchEvent(new CustomEvent("dragmove"))
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

        // detect if the user changes the colour of this arrow
        window.addEventListener('colourchange', (e) => {
            if (e.detail.oldColour === arrowObject.colour) {
                connector.setLineColor(e.detail.newColour)
                arrowObject.colour = e.detail.newColour
            }
        })

        // detect if all arrows of this colour were deleted
        window.addEventListener('arrowdelete', (e) => {
            if (e.detail.colour === arrowObject.colour) {
                this.remove_arrow(connector, arrowObject)
            }
        })
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

    changeArrowColour(entry, direction) {
        const oldColour = entry.colour
        var newColour = this.getNextAvailableColour(entry, direction)
        if (!newColour) {
            return
        }
        entry.colour = newColour

        window.dispatchEvent(new CustomEvent('colourchange', {
            detail: {
                oldColour: oldColour,
                newColour: newColour,
            }
        }))

        this.shared_state.logger.logEvent({'type': 'update_arrow_colour', 'newColour': newColour});

        return newColour
    }

    getNextAvailableColour(entry, direction) {
        // find all the colours which are not used by arrowOptions other than this one
        const availableColours = COLOURS.filter(colour => 
            !this.arrowOptions.find(option => option.colour === colour && option !== entry)
        )

        if (!availableColours) {
            return undefined
        } else {
            const thisColourIndex = entry ? availableColours.indexOf(entry.colour) : 0
            if (thisColourIndex !== -1) {
                var nextIndex = (thisColourIndex + 1 * direction) % availableColours.length
                if (nextIndex < 0) {
                    nextIndex = availableColours.length - 1
                }
                return availableColours[nextIndex]
            }
        }
    }

    getArrowOptions() {
        const clickEditButton = (e, params) => {
            const MAX_ARROW_TYPE_NAME_LENGTH = 50 // chars

            var { colourCell, nameCell, buttonCell, underlyingEntry, transientEntry } = params

            transientEntry.isClickable = false

            var editButton = buttonCell.children[0]

            const updateName = () => {
                var newValue = input.value
                if (newValue.length >= MAX_ARROW_TYPE_NAME_LENGTH) {
                    newValue = newValue.substring(0, MAX_ARROW_TYPE_NAME_LENGTH)
                }
                if (newValue) {
                    underlyingEntry.name = newValue
                }

                return newValue
            }

            const finishEditing = () => {
                var newValue = updateName()
                if (newValue) {
                    nameCell.textContent = newValue
                }

                transientEntry.isClickable = true

                colourCell.textContent = colourButton.textContent
                colourCell.style.color = colourButton.style.color
                
                editButton.classList.remove('pure-button-active')
                editButton.onclick = (e) => clickEditButton(e, params)
            }

            editButton.classList.add('pure-button-active')
            editButton.onclick = finishEditing

            var input = document.createElement("input")
            
            input.style.width = (nameCell.getBoundingClientRect().width - 5).toString() + "px"
            input.value = nameCell.textContent
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' && input.value) {
                    finishEditing()
                }
            })
            input.addEventListener('change', updateName)

            nameCell.textContent = ""
            nameCell.appendChild(input)

            var colourButton = document.createElement("button")
            colourButton.className = 'pure-button'
            colourButton.textContent = colourCell.textContent
            colourCell.textContent = ""
            colourCell.appendChild(colourButton)
            colourButton.style.color = colourCell.style.color
            colourButton.style.padding = 0
            colourButton.addEventListener("click", () => {
                colourButton.style.color = this.changeArrowColour(underlyingEntry, 1)
                transientEntry.colour = underlyingEntry.colour
            })
            colourButton.addEventListener("contextmenu", (e) => {
                colourButton.style.color = this.changeArrowColour(underlyingEntry, -1)  // on right click, scroll backwards through the colours
                transientEntry.colour = underlyingEntry.colour
                e.preventDefault()
            })

            input.focus()
        }

        const clickDeleteArrowTypeButton = (e, params) => {
            var { row, underlyingEntries, underlyingEntry, transientEntry, selected, hidePopup } = params
            transientEntry.isClickable = false
            
            if (window.confirm('Are you sure you want to delete all "' + underlyingEntry.name + '" arrows? This cannot be undone.')) {
                // remove from underlyingEntries
                var index = underlyingEntries.indexOf(underlyingEntry)
                if (index !== -1) {
                    underlyingEntries.splice(index, 1)
                }

                // remove row after 0 delay to prevent this click event being registered as a click outside the option popup
                setTimeout(() => row.parentNode.removeChild(row), 0)

                // tell all arrows of this colour to delete themselves
                window.dispatchEvent(new CustomEvent('arrowdelete', {
                    detail: {
                        colour: underlyingEntry.colour,
                    }
                }))

                this.shared_state.logger.logEvent({'type': 'delete_arrow_type', 'colour': underlyingEntry.colour})

                // if the selected arrow type was deleted, hide the optionpopup
                if (selected) {
                    hidePopup()
                }
            }

            transientEntry.isClickable = true
        }

        const arrowOptionsWithButtons = this.arrowOptions.map(entry => {
            var entryWithButtons = {...entry}
            entryWithButtons.buttons = [
                {
                    className: 'edit-icon',
                    click: clickEditButton,
                    underlyingEntry: entry,
                },
                {
                    className: 'delete-icon',
                    click: clickDeleteArrowTypeButton,
                    underlyingEntry: entry,
                    underlyingEntries: this.arrowOptions,
                }
            ]
            return entryWithButtons
        })
        
        return [
            ...arrowOptionsWithButtons,
            {'colour': 'black', 'name': ADD_ARROW_TYPE_MENU_ITEM, 'symbol': '+'},
            {'colour': 'red', 'name': 'Delete', 'symbol': "🗙"}
        ]
    }

    edit_connector_type(connector, popup_x, popup_y, hideOnClickOutside, onColourSelected, arrowObject) {
        var prev_selected = undefined;
        
        const arrowOptions = this.getArrowOptions()

        prev_selected = arrowOptions.find(entry => entry.colour === connector.line.attr('stroke') && entry.name !== 'Delete' && entry.name !== ADD_ARROW_TYPE_MENU_ITEM)
        prev_selected = prev_selected ? prev_selected.name : undefined

        const setArrowColour = (selected_option) => {
            connector.setLineColor(selected_option.colour);
            this.shared_state.logger.logEvent({'type': 'arrow_set_type', 'id': connector.id, 'new_type': selected_option.name});

            if (onColourSelected) {
                onColourSelected(selected_option.colour)
            }
        }

        new OptionPopup(arrowOptions, popup_x, popup_y, hideOnClickOutside, (selected_option) => {
            if (selected_option.name === "Delete") {
                this.shared_state.logger.logEvent({'type': 'arrow_delete', 'id': connector.id});
                this.remove_arrow(connector, arrowObject);
            } else if (selected_option.name === ADD_ARROW_TYPE_MENU_ITEM) {
                const colour = this.getNextAvailableColour(null, 1)

                if (!colour) {
                    toast.error("Maximum number of arrow types reached!")
                } else {
                    const newRelation = {
                        'name': 'New relation',
                        'colour': colour,
                        'symbol': "→",
                    }
                    this.arrowOptions.push(newRelation)
                    this.shared_state.logger.logEvent({'type': 'add_arrow_type', 'colour': colour});

                    if (!prev_selected) {
                        setArrowColour(newRelation)
                    }

                    // open a new option popup to allow the user to select the new arrow type and edit it
                    this.edit_connector_type(connector, popup_x, popup_y, true, onColourSelected, arrowObject)
                }
            } else {
                setArrowColour(selected_option)
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