const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('config/database.json');
const db = low(adapter);

db.defaults({matches: []}).write();

module.exports = db;
