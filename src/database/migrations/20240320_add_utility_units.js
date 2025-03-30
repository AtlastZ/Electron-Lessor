const database = require('../config');

async function up() {
  try {
    // Add new columns to rooms table
    await database.run(`
      ALTER TABLE rooms
      ADD COLUMN water_unit REAL NOT NULL DEFAULT 0;
    `);

    await database.run(`
      ALTER TABLE rooms
      ADD COLUMN water_cost_per_unit REAL NOT NULL DEFAULT 0;
    `);

    await database.run(`
      ALTER TABLE rooms
      ADD COLUMN electric_unit REAL NOT NULL DEFAULT 0;
    `);

    await database.run(`
      ALTER TABLE rooms
      ADD COLUMN electric_cost_per_unit REAL NOT NULL DEFAULT 0;
    `);

    console.log('Successfully added utility unit columns to rooms table');
  } catch (error) {
    console.error('Error adding utility unit columns:', error);
    throw error;
  }
}

async function down() {
  try {
    // Remove the columns in reverse order
    await database.run(`
      ALTER TABLE rooms
      DROP COLUMN electric_cost_per_unit;
    `);

    await database.run(`
      ALTER TABLE rooms
      DROP COLUMN electric_unit;
    `);

    await database.run(`
      ALTER TABLE rooms
      DROP COLUMN water_cost_per_unit;
    `);

    await database.run(`
      ALTER TABLE rooms
      DROP COLUMN water_unit;
    `);

    console.log('Successfully removed utility unit columns from rooms table');
  } catch (error) {
    console.error('Error removing utility unit columns:', error);
    throw error;
  }
}

module.exports = {
  up,
  down
}; 