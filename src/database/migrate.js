const fs = require('fs');
const path = require('path');
const database = require('./config');

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await database.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get executed migrations
    const executedMigrations = await database.all('SELECT name FROM migrations');
    const executedNames = new Set(executedMigrations.map(m => m.name));

    // Run migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of migrationFiles) {
      if (!executedNames.has(file)) {
        console.log(`Running migration: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        await migration.up();
        await database.run('INSERT INTO migrations (name) VALUES (?)', [file]);
        executedNames.add(file);
      }
    }

    // Run seeds
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of seedFiles) {
      console.log(`Running seed: ${file}`);
      const seed = require(path.join(seedsDir, file));
      await seed.up();
    }

    console.log('All migrations and seeds completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

async function rollbackMigrations() {
  try {
    // Get executed migrations in reverse order
    const executedMigrations = await database.all('SELECT name FROM migrations ORDER BY id DESC');
    
    // Run down migrations
    for (const migration of executedMigrations) {
      console.log(`Rolling back migration: ${migration.name}`);
      const migrationModule = require(path.join(__dirname, 'migrations', migration.name));
      await migrationModule.down();
      await database.run('DELETE FROM migrations WHERE name = ?', [migration.name]);
    }

    console.log('All migrations rolled back successfully');
  } catch (error) {
    console.error('Error rolling back migrations:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  database.connect()
    .then(async () => {
      try {
        if (command === 'rollback') {
          await rollbackMigrations();
        } else {
          await runMigrations();
        }
      } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
      } finally {
        await database.close();
      }
    })
    .catch(error => {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
  rollbackMigrations
}; 