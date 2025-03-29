const database = require('./config');

async function runSeeds() {
  try {
    // Connect to database
    await database.connect();
    console.log('Connected to database');

    // Run seeds
    const seedsDir = require('path').join(__dirname, 'seeds');
    const seedFiles = require('fs').readdirSync(seedsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of seedFiles) {
      console.log(`Running seed: ${file}`);
      const seed = require(require('path').join(seedsDir, file));
      await seed.up();
    }

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = {
  runSeeds
}; 