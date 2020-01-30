export default class Logger {
    shouldLogToConsole = true;

    constructor(id) {
        this.id = id;
        this.logToConsole("Logging begin, id " + id);
    }

    // Generate an ID from the current time to avoid collision
    static getNewId() {
        return Number(new Date()).toString(36);
    }

    logEvent(event) {
        var log = this.getLog();
        if (log.events === undefined) {
            log.events = {};
        }

        if (log.events[event.type] === undefined) {
            log.events[event.type] = [];
        }
        event.timestamp = new Date();
        log.events[event.type].push(event);
        this.setLog(log);

        this.logToConsole("Logging event: " + JSON.stringify(event));
    }

    static retrieveLog(id) {
        return localStorage.getItem(Logger.getStorageString(id));
    }

    getLog() {
        var log = JSON.parse(Logger.retrieveLog(this.id));
        if (!log || log === undefined) {
            log = {}
        }
        return log;
    }

    setLog(log) {
        localStorage.setItem(Logger.getStorageString(this.id), JSON.stringify(log));
    }

    static getStorageString(id) {
        return "log_" + id;
    }

    logToConsole(msg) {
        if (this.shouldLogToConsole) {
            console.log(msg);
        }
    }
}