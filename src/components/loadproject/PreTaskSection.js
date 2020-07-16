import React, { Component } from 'react';

export default class PreTaskSection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        this.setState({ value: event.target.value })
    }

    handleSubmit(event) {
        event.preventDefault()
        if (!this.state.value || this.state.value === "") {
            alert("Please enter an answer")
            return
        }

        if (window.confirm("Are you ready submit your answer? You cannot undo this action")) {
            localStorage.setItem('preTaskSubmission', this.state.value)
            this.props.transitionToMenu()
        }
    }

    render() {
        // eslint-disable-next-line no-useless-concat
        var emailAddress = 'ab' + '390' + '@st-andrews' + '.ac.uk' // concat to avoid having the raw email address in git
        return (
            <div className='intro-section'>
                <h3 style={{paddingTop: "40px"}}>Thank you for participating in this experiment!</h3>
                <ol className="steps">
                    <li>
                        <p>Before we begin, please complete this <a href="https://standrews.eu.qualtrics.com/jfe/form/SV_9tYNKrCBK8uHOiV">short, anonymous demographics
                            questionnaire</a> if you have not done so already.</p>
                    </li>
                    <li>
                        <p> Then, write 1-2 paragraphs answering the question below:</p>
                        <p><b>When you write an essay, what do you aim to produce? What makes a good essay?</b></p>

                        <form onSubmit={this.handleSubmit} className="pure-form pure-form-stacked">
                            <textarea className="pure-input-1" rows="14" value={this.state.value} onChange={this.handleChange} placeholder="Your answer..." />
                            <input className="pure-button button-primary" type="submit" value="Submit answer" />
                        </form>

                    </li>
                </ol>

                <p><i>Any questions? Get in touch at <a href={'mailto:' + emailAddress + '?subject=Write Reason question'}>{emailAddress}</a>.</i></p>
            </div>
        )
    }
}