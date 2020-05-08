import React, { Component } from 'react';
import './LoadProject.css'
import db from '../../db.js'
import ProjectList from './ProjectsList.js'
import SharedState from '../../shared_state.js';

export default class LoadProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: []
        };
        this.addProject = this.addProject.bind(this)
        this.deleteProject = this.deleteProject.bind(this)
        this.loadProject = this.loadProject.bind(this)
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
        // todo - only retrieve relevant rows from projects table
        db.table('projects')
            .toArray(projects => {
                this.setState({ projects })
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
                <ProjectList projects={this.state.projects} deleteProject={this.deleteProject} loadProject={this.loadProject}/>
                <p>
                    <button className="pure-button pure-button-primary" onClick={this.addProject}>New project</button>
                </p>
            </div>
        );
      }
}