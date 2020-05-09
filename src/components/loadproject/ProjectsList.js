import React, { Component } from 'react';

export default class FilesList extends Component {
    
    render() {
        return (
            <table className='pure-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.projects.map(project => <tr key={project.id.toString()}>
                            <td>{project.id}</td>
                            <td>{project.name}</td>
                            <td><button className="pure-button" onClick={() => this.props.loadProject(project.id)}>Open</button></td>
                            <td><button className="pure-button" onClick={() => this.props.renameProject(project.id)}>Rename</button></td>
                            <td><button className="pure-button" onClick={() => this.props.duplicateProject(project.id)}>Duplicate</button></td>
                            <td><button className="pure-button" onClick={() => this.props.deleteProject(project.id)}>Delete</button></td>
                        </tr>)
                    }
                </tbody>
            </table>
        );
      }
}