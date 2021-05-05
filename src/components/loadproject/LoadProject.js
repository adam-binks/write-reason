import React, { Component } from 'react';
import './LoadProject.css'
import db from '../../db.js'
import SharedState from '../../shared_state.js';
import LogLoadButton from './LogLoadButton.js';
import { toast } from 'react-toastify';

export default class LoadProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: []
        };
        this.loadProject = this.loadProject.bind(this)
        this.updateProjectsFromDb = this.updateProjectsFromDb.bind(this)
        this.onDropLogFiles = this.onDropLogFiles.bind(this)
        this.exploreLog = this.exploreLog.bind(this)
        
        document.title = "Write Reason"

        // skip the project select screen if the autoload prop is supplied, instead load project with that id
        if (process.env.NODE_ENV === 'development' && this.props.autoload) {
            this.loadProject(this.props.autoload)
        }
    }

    componentDidMount() {
        if (process.env.NODE_ENV !== 'development' || !this.props.autoload) {
            this.updateProjectsFromDb()
        }
    }

    updateProjectsFromDb() {
        // todo - only retrieve relevant rows from projects table?
        db.table('projects')
            .toArray(projects => {
                this.setState({ projects })
            }).catch(err => {
                toast.error("Error when loading projects: " + err)
            })
    }

    loadProject(id) {
        const params = { condition: 'graph' }
        const sharedState = new SharedState(id, params)
        this.props.transitionToEditor(sharedState)
    }

    deleteProject(id) {
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            db.table('projects')
                .delete(id)
                .then(() => {
                    this.updateProjectsFromDb()
                })
        }
    }

    onDropLogFiles(files) {
        files.forEach((file) => {
            const reader = new FileReader()
      
            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const stored = localStorage.getItem('logsToExplore') || JSON.stringify({logs: []})
                const allLogs = JSON.parse(stored).logs

                var newLog = JSON.parse(reader.result)
                newLog.filename = file.name
                newLog.projects.forEach(project => project.filename = file.name)
                allLogs.push(newLog)
                localStorage.setItem('logsToExplore', JSON.stringify({logs: allLogs}))
            }
            reader.readAsText(file)
        })
    }

    exploreLog(project, saveIndex) {
        const params = { condition: 'graph', logExplore: {project: project, saveIndex: saveIndex}, transitionToEditor: this.props.transitionToEditor }
        const sharedState = new SharedState(-1, params)
        this.props.transitionToEditor(sharedState)
    }
    
    render() {
        const participant_ids = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 15, 17, 18, 21, 22, 23, 25, 26]

        const loadLog = (id) => {
            import('../../assets/logs/' + id + '.json')
            .then((log) => {
                console.log(log)
                this.exploreLog(log.projects[0], log.projects[0].log.saves.length - 1)
            })
            document.title = "P" + id + " - Write Reason"
        }

        return (
            <div className="load-project">
                <div className="logs-grid">
                    {
                        participant_ids.map(id => <LogLoadButton participant_id={id} loadLog={loadLog} key={id}/>)
                    }
                    
                </div>
            </div>
        );
      }
}