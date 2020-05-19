import db from './db.js'
import { toast } from 'react-toastify';

const EVENT_TYPES_WHICH_DO_NOT_MAKE_STATE_DIRTY = [
    'session_start',
    'document_content_detailed',
    'document_content_markdown',
]

export default class Logger {
    shouldLogToConsole = false;

    constructor(db_id, params) {
        this.db_id = db_id;
        this.conditions = params;
        this.logToConsole("Logging begin, db_id " + db_id + "\nParams " + JSON.stringify(params, null, 1));

        // used for tracking whether changes have been made since last save
        // obviously, does not track events which are not logged, like typing in the document
        this.stateIsDirty = false

        this.logEvent({'type': 'session_start'})
    }

    logEvent(event) {
        if (!EVENT_TYPES_WHICH_DO_NOT_MAKE_STATE_DIRTY.includes(event.type)) {
            this.stateIsDirty = true
        }

        if (event.type === 'save') {
            this.stateIsDirty = false
        }

        this.getLog(log => {
            if (log.events === undefined) {
                log.events = {}
            }
    
            if (log.events[event.type] === undefined) {
                log.events[event.type] = []
            }
            event.timestamp = new Date()
            log.events[event.type].push(event)
            this.setLog(log)

            this.logToConsole("Logging event: " + JSON.stringify(event))
        })
    }

    // keep a history of the save states so that we can look back at how the project developed
    logSaveState(save, forceLog=false) {
        this.getLog(log => {
            if (log.saves === undefined) {
                log.saves = []
            }

            // don't store this save if we have stored a save <3 minutes ago
            // to prevent multiple clicks of the save button taking up lots of space
            const timestamp = new Date()
            const THREE_MINUTES = 3 * 60 * 1000; // ms
            if (forceLog || !log.saves.find(save => (timestamp - save.timestamp < THREE_MINUTES))) {
                log.saves.push({
                    timestamp: timestamp,
                    ...save,
                })
                this.setLog(log)
            }
        })
    }

    getLog(callback) {
        db.table('projects')
            .get(this.db_id)
            .then((project) => {
                callback(project.log ? project.log : {})
            })
    }

    setLog(log) {
        db.table('projects')
            .update(this.db_id, { log: log })
            .catch(err => {
                toast.error('Logging error: ' + err)
                console.log('Logging error: ' + err)
            })
    }

    logToConsole(msg) {
        if (this.shouldLogToConsole) {
            console.log(msg);
        }
    }
}