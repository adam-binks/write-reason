class MouseFollower {
    constructor(parent_element, svg, connectables_container, markers) {
        this.connector = undefined;
        this.connectables_container = connectables_container;
        this.markers = markers;

        var parent_rect = parent_element.getBoundingClientRect();
        this.mouse_rect = svg.group();
        parent_element.addEventListener('mousemove', e => {
            this.mouse_rect.move(e.clientX - parent_rect.left, e.clientY - parent_rect.top);
            
            if (typeof(this.connector) !== 'undefined') {
                this.connector.update();
            }
        });
    }

    update_source(new_source) {
        if (typeof(this.connector) === 'undefined') {
            this.connector = new_source.connectable({
                container: this.connectables_container,
                markers: this.markers
            }, this.mouse_rect);
            this.connector.setLineColor("#5D4037");
        } else {
            this.connector.target = this.mouse_rect;
            this.connector.source = new_source;
            this.connector.update();
        }
    }

    hide() {
        if (typeof(this.connector) !== 'undefined') {
            this.connector.target = this.connector.source;
        }
    }
}

export default MouseFollower;