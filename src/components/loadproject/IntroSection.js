import React, { Component } from 'react';
import Logo from '../../assets/logo.png'
import "video-react/dist/video-react.css"

export default class IntroSection extends Component {
    
    render() {
        return (
            <div className='intro-section'>
                <a href="https://adam-binks.github.io/write-reason/"><img src={Logo} className='logo' alt="Write Reason"/></a>

                <p>Explore the representations created by participants in our study:</p>
            </div>
        );
      }
}