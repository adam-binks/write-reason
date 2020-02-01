import React, { Component } from 'react';
import './ConditionForm.css'

export default class ConditionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            experimentId: "",
            novelToolFirst: false,
            duration: 1.1 * 1000 * 60 // calculates seconds, and then into minutes
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }
    
    handleSubmit(event) {
        event.preventDefault();

        this.setState({'condition': this.state.novelToolFirst ? 'graph' : 'plain'}, () => {
            this.props.submitFunc(this.state);
        });
    }
    
    render() {
        return (
            <div className="condition-form">
                <form onSubmit={this.handleSubmit} className="pure-form pure-form-stacked">
                    <fieldset>
                        <input type="number" name="experimentId" value={this.state.experimentId} onChange={this.handleChange} placeholder="Experiment ID" />
                        
                        <label htmlFor="novelToolFirst">
                            Novel tool first <input type="checkbox" id="novelToolFirst" name="novelToolFirst" value={this.state.novelToolFirst} onChange={this.handleChange} />
                        </label>

                        <input type="submit" className="pure-button pure-button-primary" value="Begin experiment" />
                    </fieldset>
                </form>
            </div>
        );
      }
}