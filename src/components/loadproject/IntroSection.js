import React, { Component } from 'react';
import Logo from '../../assets/logo.png'
import "video-react/dist/video-react.css"

export default class IntroSection extends Component {
    
    render() {
        return (
            <div className='intro-section'>
                <a href="https://adambinks.me/write-reason/"><img src={Logo} className='logo' alt="Write Reason"/></a>

                <p>Explore the representations created by participants in our study.</p>
                <p><em>These data were collected by Adam Binks, Alice Toniolo and Miguel Nacenta, from consenting study participants, and are shared in an anonymised form as approved by University of St Andrews <a href="https://www.st-andrews.ac.uk/research/environment/committees/utrec/">UTREC</a> (approval code CS14896).</em></p>
            </div>
        );
      }
}