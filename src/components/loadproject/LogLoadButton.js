import React, { Component } from 'react'

export default class LogLoadButton extends Component {
    render() {
        const src = process.env.PUBLIC_URL + '/thumbnails/' + this.props.participant_id + '.png'
        return (
            <div className='log-load-button' onClick={() => {this.props.loadLog(this.props.participant_id)}}>
                <img src={src} className='log-load-img' alt={"P" + this.props.participant_id + " map thumbnail"}/>

                <p>P{this.props.participant_id}</p>
            </div>
        );
      }
}