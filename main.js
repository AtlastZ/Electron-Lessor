const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const database = require('./src/database/config')
const { runMigrations } = require('./src/database/migrate')

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  // Open the DevTools.
  // win.webContents.openDevTools()
}

// Handle database operations
ipcMain.handle('get-rooms', async () => {
  try {
    const rooms = await database.all('SELECT * FROM rooms ORDER BY name');
    return rooms;
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
});

ipcMain.handle('book-room', async (event, roomId) => {
  try {
    await database.run('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', roomId]);
    return { success: true };
  } catch (error) {
    console.error('Error booking room:', error);
    throw error;
  }
});

app.whenReady().then(async () => {
  try {
    // Connect to database and run migrations
    await database.connect();
    await runMigrations();
    console.log('Database initialized successfully');
    
    await createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  try {
    // Close database connection before quitting
    await database.close();
    console.log('Database connection closed');
    
    if (process.platform !== 'darwin') {
      app.quit();
    }
  } catch (error) {
    console.error('Error closing database:', error);
    app.quit();
  }
});