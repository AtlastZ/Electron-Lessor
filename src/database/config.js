const sqlite3 = require('sqlite3').verbose();
const { getDatabasePath } = require('./paths');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = getDatabasePath();
    console.log('Database path:', this.dbPath);
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to database at:', this.dbPath);
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
          return;
        }
        
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
        console.log('Database connected successfully');
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
            return;
          }
          console.log('Database closed successfully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      console.log('Running query:', sql, 'with params:', params);
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Error running query:', err);
          reject(err);
          return;
        }
        resolve(this);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      console.log('Getting result for query:', sql, 'with params:', params);
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error('Error getting result:', err);
          reject(err);
          return;
        }
        console.log('Query result:', result);
        resolve(result);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      console.log('Getting all results for query:', sql, 'with params:', params);
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error getting all results:', err);
          reject(err);
          return;
        }
        console.log('Query returned', rows.length, 'rows');
        resolve(rows);
      });
    });
  }
}

// Create a singleton instance
const database = new Database();
module.exports = database; 