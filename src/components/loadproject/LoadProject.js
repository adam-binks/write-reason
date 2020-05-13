import React, { Component } from 'react';
import './LoadProject.css'
import db from '../../db.js'
import ProjectList from './ProjectsList.js'
import SharedState from '../../shared_state.js';
import { toast } from 'react-toastify';

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
        
        // skip the project select screen if the autoload prop is supplied, instead load project with that id
        if (this.props.autoload) {
            this.loadProject(this.props.autoload)
        }
    }

    componentDidMount() {
        if (!this.props.autoload) {
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
        db.table('projects')
            .delete(id)
            .then(() => {
                this.updateProjectsFromDb()
            })
    }
    
    render() {
        return (
            <div className="load-project">
                <button className="pure-button pure-button-primary" onClick={this.addProject}>New project</button>
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