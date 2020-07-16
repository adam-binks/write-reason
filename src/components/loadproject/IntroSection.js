import React, { Component } from 'react';
import Logo from '../../assets/logo.png'
import { Player, BigPlayButton } from 'video-react'
import Video from '../../assets/instructions.mp4'
import Thumbnail from '../../assets/thumbnail.png'
import "video-react/dist/video-react.css"

export default class IntroSection extends Component {
    
    render() {
        // eslint-disable-next-line no-useless-concat
        var emailAddress = 'ab' + '390' + '@st-andrews' + '.ac.uk' // concat to avoid having the raw email address in git

        return (
            <div className='intro-section'>
                <img src={Logo} className='logo' alt="Write Reason"/>

                {!localStorage.getItem('editorHasLoadedBefore') && <h2>Thank you for your answer. Next, please watch the video 
                            below about how to use Write Reason, then try it out!</h2> }

                <Player src={Video} poster={Thumbnail}>
                    <BigPlayButton className='play-button' position='center' />
                </Player>
                <p><i>Not sure how something works? Get in touch at <a href={'mailto:' + emailAddress + '?subject=Write Reason question'}>{emailAddress}</a>.</i></p>
            </div>
        );
      }
}