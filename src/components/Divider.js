import React, { Component } from 'react';
import './Divider.css';
import drag from '../assets/drag.svg';

class Divider extends Component {
    render() {
        return (
            <div className="divider">
                <img id="drag_icon" src={drag} alt="<>" />
            </div>
        );
    }
}

export default Divider;