const database = require('../config');

async function up() {
  await database.run(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      room_cost REAL NOT NULL,
      electric_cost REAL NOT NULL,
      water_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      bill_date DATE NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);
}

async function down() {
  await database.run('DROP TABLE IF EXISTS bills');
}

module.exports = {
  up,
  down
}; 