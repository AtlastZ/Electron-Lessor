const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { getDatabasePath } = require('./paths');

async function createDatabase() {
  try {
    const dbPath = getDatabasePath();
    const dbDir = path.dirname(dbPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create a new database instance
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error creating database:', err);
        process.exit(1);
      }
      console.log('Database file created successfully at:', dbPath);
      db.close();
    });
  } catch (error) {
    console.error('Failed to create database:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createDatabase();
}

module.exports = {
  createDatabase
}; 