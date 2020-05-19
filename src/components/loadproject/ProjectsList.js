import React, { Component } from 'react';

export default class ProjectsList extends Component {
    render() {
        return (
            <div className='display-block'>
                <table className='pure-table'>
                    <thead>
                        <tr>
                            {/* {(process.env.NODE_ENV === 'development') && <th>ID</th>} */}
                            <th>Project</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.projects.map(project => <tr key={project.id.toString()}>
                                {/* {(process.env.NODE_ENV === 'development') && <td>{project.id}</td>} */}
                                <td>{project.name}</td>
                                <td>
                                    <div className="pure-button-group" role="group" aria-label="Project controls">
                                        <button className="pure-button" onClick={() => this.props.loadProject(project.id)}>Open</button>
                                        <button className="pure-button" onClick={() => this.props.renameProject(project.id)}>Rename</button>
                                        <button className="pure-button" onClick={() => this.props.duplicateProject(project.id)}>Duplicate</button>
                                        <button className="pure-button" onClick={() => this.props.deleteProject(project.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        )
      }
}