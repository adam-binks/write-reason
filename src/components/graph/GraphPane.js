import React from 'react';
import './GraphPane.css';
import SVG from 'svg.js';
import 'svg.panzoom.js';
import 'svg.draggy.js';
import './svg.connectable.js';
import MouseFollower from './MouseFollower.js';
import GraphNode from './GraphNode.js';
import DropifyGraphPane from './DropifyGraphPane.js'
import { toast } from 'react-toastify';

class GraphPane extends React.Component {
    componentDidMount() {
        this.props.sharedState.getSavedGraph((json) => {
            this.nodesList = [];

            this.props.sharedState.graphPane = this;

            this.$el = document.querySelector("#graph")

            var svg = new SVG(this.$el).size("100%", "100%").panZoom({ zoomMin: 0.2, zoomMax: 1, zoomFactor: 0.1 }); // just pan, no zoom
            this.zoomCanvasTo = (level, pos, cb) => {
                if (Math.abs(svg.zoom() - level) < 0.01) { // it doesn't zoom to the exact number
                    if (cb) { cb() }
                } else {
                    const runner = svg.animate({duration: 100, ease: '>'})
                        .zoom(level, pos)
                    
                    if (cb) { runner.after(cb) }
                }
            }

            svg.zoom(1)

            SVG.extend(SVG.Element, {
                getScreenCoords: function (zone) {
                    var root_point = this.doc().node.getBoundingClientRect()
                    var point = this.node.getBoundingClientRect()

                    if (zone === 'centre') {
                        return {
                            x: (point.left + point.right) / 2 - root_point.left,
                            y: (point.top + point.bottom) / 2 - root_point.top
                        }
                    } else {
                        return {
                            x: point.x - root_point.left,
                            y: point.y - root_point.top
                        }
                    }
                }
            })

            var links = svg.group();
            var markers = svg.group();
            var nodes = svg.group();

            const json_connections = json ? json.connections : undefined
            var mouse_follower = MouseFollower.fromJSON(json_connections, this.props.sharedState, svg, links, markers, links);
            this.mouse_follower = mouse_follower

            // add new nodes on mouse click
            svg.on('dblclick', (e) => {
                // only clicks on background and not when dragging
                if (e.target !== svg.node && !mouse_follower.drawing_arrow_from) {
                    return;
                }

                var x = e.clientX
                if (x + 200 > window.innerWidth) {
                    x = window.innerWidth - 200
                }
                var y = e.clientY
                if (y + 60 > window.innerHeight) {
                    y = window.innerHeight - 60
                }

                this.addNodeAtScreenLocation(svg, nodes, mouse_follower, "", x, y, true);
            });

            this.setupTextDropping(svg, nodes, mouse_follower);

            const blurActiveElement = (e) => {
                document.activeElement.blur();
            }
            svg.on('panStart', blurActiveElement)
            svg.on('zoom', blurActiveElement)

            var textarea = document.querySelector('#nodeedit');
            textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');
            textarea.addEventListener("input", (e) => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });

            this.props.sharedState.addGraphNode = (text, x, y, doNotDeleteIfEmptyText) => {
                if (x + 200 > window.innerWidth) {
                    x = window.innerWidth - 200
                }
                if (y + 60 > window.innerHeight) {
                    y = window.innerHeight - 60
                }
                return this.addNodeAtScreenLocation(svg, nodes, mouse_follower, text, x, y, true, doNotDeleteIfEmptyText)
            }
            if (json && json.nodes) {
                this.loadNodesFromJSON(json.nodes, mouse_follower, nodes)
            }

            this.getNodeById = this.getNodeById.bind(this)
            mouse_follower.draw_loaded_arrows(this.getNodeById)

            if (this.nodesList.length === 0) {
                this.addNoNodesIndicator(svg, nodes, mouse_follower);
            }
        })
    }

    getNodeById(id) {
        return this.nodesList.find(node => node.id.toString() === id.toString())
    }

    toJSON() {
        return {
            nodes: this.nodesList.map(node => node.toJSON()),
            connections: this.mouse_follower.toJSON()
        }
    }

    loadNodesFromJSON(json, mouse_follower, nodes) {
        this.nodesList = json.map(nodeJSON => GraphNode.fromJSON(nodeJSON, nodes, mouse_follower, this.props.sharedState, () => this.nodesList, this.zoomCanvasTo))
    }

    addNoNodesIndicator(svg, nodes, mouse_follower) {
        this.noNodesIndicator = svg.text("Double click to add a node").addClass("indicator-text").attr({x: "40%", y: "45%"});
        this.noNodesIndicator.on('dblclick', (e) => {
            this.addNodeAtScreenLocation(svg, nodes, mouse_follower, "", e.clientX, e.clientY, true);
        });
    }

    setupTextDropping(svg, nodes, mouse_follower) {
        this.$el.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        this.$el.addEventListener("drop", (e) => {
            e.preventDefault();
            if (!e.dataTransfer.types.includes("text/plain")) {
                return // the dropped thing is probably a whole block, which is handled by React-DnD in DragifyGraph.js
            }
            
            var data = e.dataTransfer.getData("Text");

            if (data.includes('\n')) {
                toast.error('You can\'t add multiple paragraphs to the graph at once')
                return
            }

            if (!this.props.sharedState.canAddLinkAtSelection()) {
                toast.error('You can\'t add the same node to the graph twice!')
                return
            }

            var x = e.clientX
            if (x + 200 > window.innerWidth) {
                x = window.innerWidth - 200
            }
            var y = e.clientY
            if (y + 60 > window.innerHeight) {
                y = window.innerHeight - 60
            }
            var node = this.addNodeAtScreenLocation(svg, nodes, mouse_follower, data, x, y, false);
            this.props.sharedState.addLinkAtSelection(node.id, node);
            this.props.sharedState.logger.logEvent({'type': 'node_create_from_doc', 'node_id': node.id, 'text': data});
            document.activeElement.blur();
        });
    }

    addNodeAtScreenLocation(svg, nodes, mouse_follower, text, x, y, focus_text_area, doNotDeleteIfEmptyText=false) {
        var point = svg.point(x, y);
        const params = {
            shortText: text,
            longText: "", 
            x: point.x,
            y: point.y,
            width: 200,
            height: 42,
            isOnGraph: false,
            id: undefined, // set automatically
            doNotDeleteIfEmptyText: doNotDeleteIfEmptyText
        }
        var node = new GraphNode(params, nodes, mouse_follower, this.props.sharedState, focus_text_area, () => this.nodesList, this.zoomCanvasTo);
        this.nodesList.push(node);

        if (this.noNodesIndicator) {
            this.noNodesIndicator.hide();
        }

        return node;
    }

    componentWillUnmount() {
        // this.$el.somePlugin('destroy');
    }

    render() {
        return this.props.connectDropTarget(
            <div id="graph" className="pane" ref={el => this.el = el}>
                <textarea id='nodeedit'></textarea>
            </div>
        );
    }
}

export default DropifyGraphPane(GraphPane);