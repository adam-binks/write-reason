import React, { Component } from 'react';
import Logo from '../../assets/logo.png'
import { Player, BigPlayButton } from 'video-react'
import Video from '../../assets/instructions.mp4'
import Thumbnail from '../../assets/thumbnail.png'
import "video-react/dist/video-react.css"

export default class IntroSection extends Component {
    
    render() {
        return (
            <div className='intro-section'>
                <a href="https://writereason.app"><img src={Logo} className='logo' alt="Write Reason"/></a>

                <>
                    <Player src={Video} poster={Thumbnail}>
                        <BigPlayButton className='play-button' position='center' />
                    </Player>
                </>
            </div>
        );
      }
}