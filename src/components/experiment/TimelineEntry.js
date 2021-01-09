import React, { Component } from 'react'

export default class TimelineEntry extends Component {
    render() {
        let theClass = ""
        if (this.props.log.type.includes('doc')) {
            theClass = 'red'
        }

        if (this.props.log.type.includes('node')) {
            theClass = 'blue'
        }

        if (this.props.log.type.includes('doc_create_from_node') || this.props.log.type.includes('doc_node_change_format')) {
            theClass = 'yellow'
        }

        if (this.props.log.type.includes('arrow')) {
            theClass = 'green'
        }

        if (this.props.isExploreHead) {
            theClass += ' explore-head'
        }

        return (
        <button className={theClass} onClick={this.props.onClick}>
            {this.props.log.type} <i>{this.props.log.id && (this.props.log.id.toString().length < 4 ?
                                                                this.props.log.id : 
                                                                this.props.log.source && this.props.log.source + " → " + this.props.log.target)}</i><br/>
            {this.props.timestampFormatted}
        </button>
        );
      }
}