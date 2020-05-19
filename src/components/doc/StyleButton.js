import React, { Component } from 'react';
import { showNodeSwitchMenu } from './NodeSwitch';

export default class StyleButton extends Component {
    render() {
        return (<button 
                    className={'style-button pure-button '
                                 + ((this.props.nodeStyle === 'section') ? 'style-button-section' : 'style-button-inline')}
                    onClick={(e) => showNodeSwitchMenu(e, this.props.node, this.props.editor)}>
                        <p className='eye-icon'></p>
                </button>)
    }
}