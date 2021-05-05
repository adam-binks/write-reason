import React, { Component } from 'react'
import TimelineEntry from './TimelineEntry'
import { Block } from 'slate'

export default class LogExploreTimeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exploreHead: undefined
        }

        this.moveExploreHead = this.moveExploreHead.bind(this)
        this.exploreEvent = this.exploreEvent.bind(this)
        this.setDocValue = this.setDocValue.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    moveExploreHead(event) {
        const graph = document.getElementById('graph')
        graph.classList.add('timeline-explore-mode')

        const orderedLogs = this.props.sharedState.params.logExplore.project.orderedLogs

        if (!orderedLogs) {
            return
        }

        this.setState({
            exploreHead: event
        })

        var pastExploreHead = false
        var lastDocChangeContent = "empty"
        for (let i = 0; i < orderedLogs.length; i++) {
            this.exploreEvent(orderedLogs[i], pastExploreHead)

            if (orderedLogs[i].type === 'doc_change' && !pastExploreHead) {
                lastDocChangeContent = orderedLogs[i].content
            }

            if (orderedLogs[i] === event) {
                pastExploreHead = true
                
                this.setDocValue(lastDocChangeContent)
            }
        }
    }

    setDocValue(text) {
        const editor = this.props.sharedState.getEditor()

        editor.moveToRangeOfDocument()
        editor.delete()
        editor.moveToStartOfDocument()

        const blockToInsert = Block.create({object: 'block', type: ''})
        const section = editor.value.document.getParent(editor.value.startBlock.key);
        const sectionParent = editor.value.document.getParent(section.key);     
        if (sectionParent) {
            const sectionIndex = sectionParent.nodes.indexOf(section);
            editor.insertNodeByKey(sectionParent.key, sectionIndex, blockToInsert);
            editor.moveBackward(1)
        }

        editor.insertText(text)
    }

    exploreEvent(event, hasNotBeenExplored) {
        const graphPane = this.props.sharedState.graphPane
        var node

        const updateSvgElement = (element) => {
            if (!element) {
                return
            }

            if (hasNotBeenExplored) {
                element.removeClass('has-been-explored')
            } else {
                element.addClass('has-been-explored')
            }
        }

        switch (event.type) {
            case 'node_create':
                node = graphPane.getNodeById(event.id)
                if (node) {
                    updateSvgElement(node.rect)
                } else if (!hasNotBeenExplored) {
                    node = graphPane.addTempNode(event.id)
                    if (node) {
                        updateSvgElement(node.rect)
                    }
                }
                break
            
            case 'node_delete':
                if (!hasNotBeenExplored) {
                    node = graphPane.getNodeById(event.id)
                    if (node) {
                        node.delete(this.props.sharedState)
                        graphPane.numTempNodes--
                    }
                }
                break
            
            case 'arrow_create':
                const arrow = graphPane.mouse_follower.getConnectorObjectConnecting(event.source, event.target)
                if (arrow) {
                    updateSvgElement(arrow.line)
                } else if (!hasNotBeenExplored) {
                    graphPane.mouse_follower.addTempArrow(event.source, event.target, "black", event.id)
                }
                break
            
            case 'arrow_delete':
                if (hasNotBeenExplored) {
                    break
                }

                const sourceDestString = graphPane.mouse_follower.temp_arrows[event.id]
                if (sourceDestString) {
                    graphPane.mouse_follower.remove_arrow(graphPane.mouse_follower.connector_objs[sourceDestString], undefined)
                    graphPane.mouse_follower.connector_objs[sourceDestString] = undefined
                }
                break

            case 'node_edit_short_text':
                node = graphPane.getNodeById(event.id)
                if (node && !hasNotBeenExplored) {
                    node.updateShortText(event.text)
                }
                break

            default:
                break
        }
    }

    handleKeyDown(e) {
        var shift = undefined
        if (e.keyCode === 39) { // right arrow
            shift = 1
        } else if (e.keyCode === 37) { // left arrow
            shift = -1
        }

        if (shift !== undefined) {
            const orderedLogs = this.props.sharedState.params.logExplore.project.orderedLogs
            if (!orderedLogs) {
                return
            }

            for (let i = 0; i < orderedLogs.length; i++) {
                if (this.state.exploreHead === orderedLogs[i]) {
                    if (i + shift > 0 && i + shift < orderedLogs.length) {
                        this.moveExploreHead(orderedLogs[i + shift])
                    }
                }
            }
        }
    }

    render() {
        const project = this.props.sharedState.params.logExplore.project
        if (!project.orderedLogs) {
            const markdown_events = project.log.events.document_content_markdown
            project.log.events.doc_change = [] 
            markdown_events.forEach((e, index) => {
                if (index === 0 || markdown_events[index - 1].content !== e.content) {
                    project.log.events.doc_change.push({type: 'doc_change', content: e.content, timestamp: e.timestamp})
                }})
            project.log.events.doc_change.forEach(e => e.type = 'doc_change')

            project.orderedLogs = [].concat.apply([], Object.values(project.log.events)).filter(e => e.type !== 'document_content_markdown')
            project.orderedLogs.sort(function(a,b){
                return new Date(a.timestamp) - new Date(b.timestamp);
            })
        }
        const logs = project.orderedLogs

        return (
            <div className="timeline" onKeyDown={this.handleKeyDown}>
                <p className="timeline-description">This timeline shows in what order the participant built their map and text.
                <br/>Click on an event to see which elements had been created at that time.</p>
                <p>{project.filename}</p>
                {logs.map((log, index) => {
                        const getDate = (timestamp) => timestamp.substring("2020-".length, "2020-07-21".length)
                        const time = log.timestamp.substring("2020-07-21T".length, "2020-07-21T12:51:45".length)

                        const makeEntry = () => <TimelineEntry
                            onClick={() => this.moveExploreHead(log)}
                            log={log}
                            timestampFormatted={time}
                            sharedState={this.props.sharedState}
                            isExploreHead={this.state.exploreHead === log}
                        />

                        if (index === 0 || getDate(log.timestamp) !== getDate(logs[index - 1].timestamp)) {
                            return <>
                                <p><b>{getDate(log.timestamp)}</b></p>
                                {makeEntry()}
                            </>
                        } else {
                            return makeEntry()
                        }
                    }
                )}
            </div>
        );
      }
}