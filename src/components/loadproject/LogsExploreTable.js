import React, { Component } from 'react';

export default class LogsExploreTable extends Component {
    render() {
        return (
            <div className='display-block'>
                <button className="pure-button" onClick={() => localStorage.removeItem('logsToExplore')}>Delete stored logs</button>
                <table className='pure-table'>
                    <tbody>
                        {
                            this.props.logs && this.props.logs.map(log => <tr key={log.filename}>
                                {/* {(process.env.NODE_ENV === 'development') && <td>{project.id}</td>} */}
                                <td>{log.filename}</td>
                                <td>
                                    <div className="pure-button-group" role="group" aria-label="Project controls">
                                        {
                                            log.projects.length > 1 && <p>MULTIPLE PROJECTS!</p>
                                        }
                                        {
                                            log.projects[0].log.saves.map((save, index) => 
                                                <button className="pure-button" onClick={(e) => this.props.exploreLog(log.projects[0], index)}>{index}</button>
                                            )
                                        }
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