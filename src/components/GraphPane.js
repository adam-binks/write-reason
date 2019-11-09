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

        var svg = new SVG(this.$el).size("100%", "100%").panZoom({zoomFactor: 0.1, zoomMin: 0.5, zoomMax: 1.5});
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

            var point = svg.point(e.clientX, e.clientY);
            new GraphNode(nodes, mouse_follower, "", point.x, point.y, 100, 80);
        });

        svg.on('panStart', (e) => {
            document.activeElement.blur();
        })

        // temp
        new GraphNode(nodes, mouse_follower, "Cool", 300, 100, 100, 80);
        new GraphNode(nodes, mouse_follower, "Nice", 400, 200, 100, 80);
        new GraphNode(nodes, mouse_follower, "Kench", 100, 400, 100, 80);
        new GraphNode(nodes, mouse_follower, "Tight", 350, 600, 100, 80);
    }

    componentWillUnmount() {
        // this.$el.somePlugin('destroy');
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