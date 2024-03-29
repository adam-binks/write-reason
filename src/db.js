import Dexie from 'dexie';

const db = new Dexie('writeReasonDb');
db.version(3).stores({ projects: '++id,name' }); // NB: this is just the *indexed* properties, not all of them!

export default db;