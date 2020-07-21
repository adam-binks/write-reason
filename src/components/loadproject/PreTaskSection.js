import React, { Component } from 'react';

export default class PreTaskSection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            q1: '',
            q2: '',
            q3: '',
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event, question) {
        this.setState({ [question] : event.target.value })
    }

    handleSubmit(event) {
        event.preventDefault()
        const questions = [this.state.q1, this.state.q2, this.state.q3]
        var shouldReturn = false
        questions.forEach(questionValue => {
            if (!shouldReturn && (!questionValue || questionValue === "")) {
                alert("Please enter an answer for all three questions")
                shouldReturn = true
                return
            }
        })
        if (shouldReturn) {
            return
        }

        if (window.confirm("Are you ready submit your answers? You cannot undo this action")) {
            localStorage.setItem('preTaskSubmission', JSON.stringify(this.state))
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
                        <p> Then, write a paragraph (at least 2 sentences) answering each of the questions below:</p>

                        <form onSubmit={this.handleSubmit} className="pure-form pure-form-stacked">
                            <label>When you write an essay, what do you aim to produce?</label>
                            <textarea className="pure-input-1" rows="10" value={this.state.value} onChange={(e) => this.handleChange(e, "q1")} placeholder="Your answer..." />
                            <label>What makes a good essay?</label>
                            <textarea className="pure-input-1" rows="10" value={this.state.value} onChange={(e) => this.handleChange(e, "q2")} placeholder="Your answer..." />
                            <label>What do you think are the possible purposes of writing an essay?</label>
                            <textarea className="pure-input-1" rows="10" value={this.state.value} onChange={(e) => this.handleChange(e, "q3")} placeholder="Your answer..." />
                            <input className="pure-button button-primary" type="submit" value="Submit answer" />
                        </form>

                    </li>
                </ol>

                <p><i>Any questions? Get in touch at <a href={'mailto:' + emailAddress + '?subject=Write Reason question'}>{emailAddress}</a>.</i></p>
                <br/>
            </div>
        )
    }
}