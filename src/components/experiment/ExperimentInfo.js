import React, { Component } from 'react';
import { toast } from 'react-toastify';

export default class ExperimentInfo extends Component {
    render() {
        // eslint-disable-next-line no-useless-concat
        const emailAddress = 'ab' + '390' + '@st-andrews' + '.ac.uk' // concat to avoid having the raw email address in git

        const scenario = localStorage.getItem('scenario')

        var question;
        if (scenario === 'biohacking') {
            question = <b>QUESTION: Should greater regulatory control be exerted over genetic biohacking?</b>
        } else if (scenario === 'sharedSpace') {
            question = <b>QUESTION: Should “shared spaces” in urban planning be promoted?</b>
        } else {
            toast.error("Question not found. Please re-open Write Reason using the link in the email we sent you.")
        }

        return (
            <>
                <h2>Instructions for study participants</h2>
                <p>Thank you for participating in this study!</p>

                <h3>Before you start</h3>
                <ol>
                    <li>Complete this <a href="https://standrews.eu.qualtrics.com/jfe/form/SV_9tYNKrCBK8uHOiV">short demographics questionnaire</a> if you haven't already. 
                        It should take a couple of minutes</li>
                    <li>Try out Write Reason (this website)! Watch the “How to use” video on the home page, and have a play around. If you’re unsure how anything works, or have 
                    any other questions, email us at <a href={'mailto:' + emailAddress + '?subject=Write Reason question'}>{emailAddress}</a>.</li>
                </ol>

                <h3>The task</h3>

                <p>Your task is to use Write Reason to decide where you stand on the question below, and use Write Reason to write a document justifying your view:</p>

                {question}

                <p>Write in the style of a short academic essay. You may not have heard of this topic before - don't worry, the fact sheet has all the information you need on it!</p>

                <h3>How to work on the task</h3>
                <ol>
                    <li>First, click the "View fact sheet" button and read through the information</li>
                    <li>Spend around 1 hour 40 minutes on this task, over the next week</li>
                    <li>Aim for around 700 words as a very rough guide - though it's fine to exceed this!</li>
                    <li>Whenever you work on the task record it in the diary. <a href='/diary_template.csv' download>Download a blank diary here</a></li>
                    <li>Please do not enter any personal information when using Write Reason</li>
                    <li>Your work will be saved in your browser on this computer when you press "Save"</li>
                </ol>

                <h3>What to do when you're finished</h3>
                <ol>
                    <li>Press the "Export logs" button in the bottom right of the screen, and keep the downloaded file somewhere safe</li>
                    <li>Make sure your diary is filled out</li>
                    <li>Email us at <a href={'mailto:' + emailAddress + '?subject=Write Reason task complete'}>{emailAddress}</a> to arrange an interview about your experiences!
                        During the interview you will send us the logs and your diary</li>
                    <li>You will receive a £20 Amazon voucher to thank you for your time</li>
                </ol>

                <p>Your contribution to our research is incredibly valuable, thank you!</p>
            </>
        );
    }
}