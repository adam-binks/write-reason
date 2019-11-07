import React from 'react';
import './GraphPane.css';
import SVG from 'svg.js';
import 'svg.draggy.js';
import 'svg.connectable.js'

class GraphPane extends React.Component {
    componentDidMount() {
        this.$el = document.querySelector("#graph")

        var svg = new SVG(this.$el).size("100%", "100%");
        var links = svg.group();
        var markers = svg.group();
        var nodes = svg.group();

        var g1 = nodes.group().translate(300, 100).draggy();
        var rect = g1.rect(100, 80).radius(10).fill("#C2185B");
        var text = g1.text("Node 1");
        rect.click(function () {
            document.activeElement.blur(); // remove focus from everything

            var textarea = document.querySelector('#nodeedit');
            textarea.value = text.text();
            textarea.style.left = g1.x() + "px";
            textarea.style.top = g1.y() + "px";
            textarea.style.display = "inline-block";
            textarea.focus();
            var save_changes = function () {
                text.text(textarea.value);
            }
            var save_and_hide = function () {
                save_changes();
                textarea.style.display = "none";
            }
            textarea.onblur = save_and_hide;
            textarea.onkeyup = function (e) {
                save_changes();
                if (e.key === "Escape" || e.key === "Esc" || e.key === "Enter") {
                    save_and_hide();
                }
            }
        });

        var g2 = nodes.group().translate(100, 100).draggy();
        g2.circle(50).fill("#E91E63");

        var g3 = nodes.group().translate(200, 300).draggy();
        g3.circle(100).fill("#FF5252");

        g1.connectable({
            container: links,
            markers: markers
        }, g2).setLineColor("#5D4037");

        g2.connectable({
            container: links,
            markers: markers
        }, g1).setLineColor("#5D4037");

        g2.connectable({
            padEllipse: true
        }, g3).setLineColor("#5D4037");
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