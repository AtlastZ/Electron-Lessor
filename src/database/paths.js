const path = require('path');
const os = require('os');

function getDatabasePath() {
  // In development, store the database in the project directory
  if (process.env.NODE_ENV !== 'production') {
    return path.join(process.cwd(), 'database.sqlite');
  }
  
  // In production, store in user's home directory
  const homeDir = os.homedir();
  const appDir = path.join(homeDir, '.electron-lessor');
  return path.join(appDir, 'database.sqlite');
}

module.exports = {
  getDatabasePath
}; 