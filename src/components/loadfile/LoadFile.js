import React, { Component } from 'react';
import './LoadFile.css'
import db from '../../db.js'
import FileList from './FilesList.js'
import SharedState from '../../shared_state.js';

export default class LoadFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: []
        };
        this.addProject = this.addProject.bind(this)
        this.deleteProject = this.deleteProject.bind(this)
        this.loadProject = this.loadProject.bind(this)
        this.updateProjectsFromDb = this.updateProjectsFromDb.bind(this)
    }

    componentDidMount() {
        this.updateProjectsFromDb()
    }

    updateProjectsFromDb() {
        // todo - only retrieve relevant rows from projects table
        db.table('projects')
            .toArray(projects => {
                this.setState({ projects })
            })
    }

    loadProject(id) {
        const sharedState = new SharedState({})
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
            <div className="load-file">
                <FileList projects={this.state.projects} deleteProject={this.deleteProject} loadProject={this.loadProject}/>
                <p>
                    <button className="pure-button pure-button-primary" onClick={this.addProject}>New project</button>
                </p>
            </div>
        );
      }
}