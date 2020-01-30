import React from 'react';
import './GraphPane.css';
import ExperimentControls from '../experiment/ExperimentControls.js'
import SVG from 'svg.js';
import 'svg.panzoom.js';
import 'svg.draggy.js';
import './svg.connectable.js';
import MouseFollower from './MouseFollower.js';
import GraphNode from './GraphNode.js';

class GraphPane extends React.Component {
    componentDidMount() {
        this.nodes = [];

        this.props.sharedState.graphPane = this;

        this.$el = document.querySelector("#graph")

        var svg = new SVG(this.$el).size("100%", "100%").panZoom({ zoomMin: 1, zoomMax: 1 }); // just pan, no zoom

        SVG.extend(SVG.Element, {
            getScreenCoords: function () {
                var root_point = this.doc().node.getBoundingClientRect();
                var point = this.point(0, 0);
                return {
                    x: -point.x - root_point.left,
                    y: -point.y - root_point.top
                };
            }
        })

        var links = svg.group();
        var markers = svg.group();
        var nodes = svg.group();

        var mouse_follower = new MouseFollower(this.props.sharedState, svg, links, markers, links);

        // add new nodes on mouse click
        svg.on('dblclick', (e) => {
            // only clicks on background and not when dragging
            if (e.target !== svg.node && !mouse_follower.drawing_arrow_from) {
                return;
            }

            this.addNodeAtScreenLocation(svg, nodes, mouse_follower, "", e.clientX, e.clientY, true);
        });

        this.setupTextDropping(svg, nodes, mouse_follower);

        svg.on('panStart', (e) => {
            document.activeElement.blur();
        });

        var textarea = document.querySelector('#nodeedit');
        textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');
        textarea.addEventListener("input", (e) => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        });

        this.addNoNodesIndicator(svg, nodes, mouse_follower);

        // temp
        // this.addNodeAtScreenLocation(svg, nodes, mouse_follower, "Radical", 1200, 300, false);
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
            var data = e.dataTransfer.getData("Text");
            var node = this.addNodeAtScreenLocation(svg, nodes, mouse_follower, data, e.clientX, e.clientY, false);
            this.props.sharedState.addLinkAtSelection(node.id, node);
            document.activeElement.blur();

            this.props.sharedState.logger.logEvent({'type': 'node_create_from_doc', 'node_id': node.id, 'text': data});
        });
    }

    addNodeAtScreenLocation(svg, nodes, mouse_follower, text, x, y, focus_text_area) {
        var point = svg.point(x, y);
        var node = new GraphNode(nodes, mouse_follower, this.props.sharedState, text, point.x, point.y, 100, 80, focus_text_area);
        this.nodes.push(node);

        this.noNodesIndicator.hide();

        return node;
    }

    componentWillUnmount() {
        // this.$el.somePlugin('destroy');
    }

    render() {
        return (
            <div id="graph" className="pane" ref={el => this.el = el}>
                <textarea id='nodeedit'></textarea>
                <ExperimentControls sharedState={this.props.sharedState} />
            </div>
        );
    }
}

export default GraphPane;