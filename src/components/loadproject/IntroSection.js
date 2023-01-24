import React, { Component } from 'react';
import Logo from '../../assets/logo.png'
import "video-react/dist/video-react.css"

export default class IntroSection extends Component {
    
    render() {
        return (
            <div className='intro-section'>
                <a href="https://writereason.app"><img src={Logo} className='logo' alt="Write Reason"/></a>

                <p>Explore the representations created by participants in our study,<br/> <a href="https://doi.org/10.1016/j.ijhcs.2022.102851"><em>Representational transformations: Using maps to write essays</em></a>.</p>
            </div>
        );
      }
}