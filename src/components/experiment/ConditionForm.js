import React, { Component } from 'react';

export default class ConditionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            experimentId: 0,
            novelToolFirst: false
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
        this.props.submitFunc(this.state);
      }
    
      render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Experiment ID:
                    <input type="number" name="experimentId" value={this.state.experimentId} onChange={this.handleChange} />
                </label>
                <label>
                    Novel tool first:
                    <input type="checkbox" name="novelToolFirst" value={this.state.novelToolFirst} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Begin experiment" />
            </form>
        );
      }
}