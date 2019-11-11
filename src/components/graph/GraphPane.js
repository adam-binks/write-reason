import React from 'react';
import './GraphPane.css';
import SVG from 'svg.js';
import 'svg.panzoom.js';
import 'svg.draggy.js';
import 'svg.connectable.js';
import MouseFollower from './MouseFollower.js'
import GraphNode from './GraphNode.js'

class GraphPane extends React.Component {
    componentDidMount() {
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

        var mouse_follower = new MouseFollower(this.$el, svg, links, markers, links);

        // add new nodes on mouse click
        svg.on('dblclick', (e) => {
            // only clicks on background and not when dragging
            if (e.target !== svg.node && !mouse_follower.drawing_arrow_from) {
                return;
            }

            this.addNodeAtScreenLocation(svg, nodes, mouse_follower, "", e.clientX, e.clientY);
        });

        // todo FIX
        // svg.on('drop', this.onDrop);
        document.addEventListener("drop", function (event) {
            event.preventDefault();
            // if (event.target.id === "graph") {
                var data = event.dataTransfer.getData("Text");
                console.log(data);
            // }
        });

        svg.on('panStart', (e) => {
            document.activeElement.blur();
        });
    }

    addNodeAtScreenLocation(svg, nodes, mouse_follower, text, x, y) {
        var point = svg.point(x, y);
        new GraphNode(nodes, mouse_follower, text, point.x, point.y, 100, 80);
    }

    componentWillUnmount() {
        // this.$el.somePlugin('destroy');
    }

    onDrop(e) {
        e.preventDefault();
        var data = e.dataTransfer.getData("Text");
        console.log(data);
    }

    render() {
        return (
            <div id="graph" className="pane" ref={el => this.el = el}>
                <textarea id='nodeedit'></textarea>
            </div>
        );
    }
}

export default GraphPane;