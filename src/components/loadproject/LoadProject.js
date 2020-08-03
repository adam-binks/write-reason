import React, { Component } from 'react';
import './LoadProject.css'
import db from '../../db.js'
import ProjectList from './ProjectsList.js'
import LogsExploreTable from './LogsExploreTable.js'
import SharedState from '../../shared_state.js';
import { toast } from 'react-toastify';
import DropZone from 'react-dropzone';

export default class LoadProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: []
        };
        this.addProject = this.addProject.bind(this)
        this.deleteProject = this.deleteProject.bind(this)
        this.loadProject = this.loadProject.bind(this)
        this.renameProject = this.renameProject.bind(this)
        this.duplicateProject = this.duplicateProject.bind(this)
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

    addProject() {
        const project = {name: window.prompt('Name your project', 'New project')}
        if (project.name) {
            db.table('projects')
                .add(project)
                .then(() => {
                    this.updateProjectsFromDb()
                });
        }
    }

    renameProject(id) {
        db.table('projects')
            .get(id)
            .then((project) => {
                const newName = window.prompt('Set a new project name', project.name)
                if (newName) {
                    db.table('projects')
                        .update(id, { name: newName })
                        .then(() => {
                            this.updateProjectsFromDb()
                        })
                }
            });
    }

    duplicateProject(id) {
        db.table('projects')
            .get(id)
            .then((project) => {
                project.name += ' (copy)'
                delete project.id // set a new one automatically
                db.table('projects')
                    .add(project)
                    .then(() => {
                        this.updateProjectsFromDb()
                    });
            })
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
        return (
            <div className="load-project">
                <button className="pure-button button-primary" onClick={this.addProject}>New project</button>
                {process.env.NODE_ENV === 'development' && <><DropZone onDrop={this.onDropLogFiles}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drop/select log files</p>
                            </div>
                            </section>
                        )}
                    </DropZone>
                    
                    <div className="load-project-table">
                        <LogsExploreTable logs={localStorage.getItem('logsToExplore') && JSON.parse(localStorage.getItem('logsToExplore')).logs} 
                            exploreLog={this.exploreLog} />
                    </div>
                    </>
                    }
                <div className="load-project-table">
                    {this.state.projects && this.state.projects.length > 0 && <ProjectList projects={this.state.projects}
                        deleteProject={this.deleteProject}
                        loadProject={this.loadProject}
                        renameProject={this.renameProject}
                        duplicateProject={this.duplicateProject}
                    />}
                </div>
            </div>
        );
      }
}