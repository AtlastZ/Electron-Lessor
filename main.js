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

  win.loadFile('src/pages/index.html')
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

ipcMain.handle('get-room-by-id', async (event, roomId) => {
  try {
    const room = await database.get('SELECT * FROM rooms WHERE id = ?', [roomId]);
    return room;
  } catch (error) {
    console.error('Error getting room by ID:', error);
    throw error;
  }
});

ipcMain.handle('create-room', async (event, roomData) => {
  try {
    const result = await database.run(
      'INSERT INTO rooms (name, status, description, price, water_unit, water_cost_per_unit, electric_unit, electric_cost_per_unit, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      [roomData.name, roomData.status, roomData.description, roomData.price, roomData.water_unit, roomData.water_cost_per_unit, roomData.electric_unit, roomData.electric_cost_per_unit]
    );
    return { id: result.lastID };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
});

ipcMain.handle('update-room', async (event, roomId, roomData) => {
  try {
    await database.run(
      'UPDATE rooms SET name = ?, status = ?, description = ?, price = ?, water_unit = ?, water_cost_per_unit = ?, electric_unit = ?, electric_cost_per_unit = ? WHERE id = ?',
      [roomData.name, roomData.status, roomData.description, roomData.price, roomData.water_unit, roomData.water_cost_per_unit, roomData.electric_unit, roomData.electric_cost_per_unit, roomId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating room:', error);
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

// Bill-related IPC handlers
ipcMain.handle('get-bills', async () => {
  try {
    const bills = await database.all(`
      SELECT b.*, r.name as room_name 
      FROM bills b 
      JOIN rooms r ON b.room_id = r.id 
      ORDER BY b.bill_date DESC
    `);
    return bills;
  } catch (error) {
    console.error('Error getting bills:', error);
    throw error;
  }
});

ipcMain.handle('get-bills-by-room', async (event, roomId) => {
  try {
    const bills = await database.all(
      'SELECT * FROM bills WHERE room_id = ? ORDER BY bill_date DESC',
      [roomId]
    );
    return bills;
  } catch (error) {
    console.error('Error getting bills by room:', error);
    throw error;
  }
});

ipcMain.handle('get-bills-by-room-and-date-range', async (event, roomId, startDate, endDate) => {
  try {
    const bills = await database.all(
      'SELECT * FROM bills WHERE room_id = ? AND bill_date BETWEEN ? AND ?',
      [roomId, startDate, endDate]
    );
    return bills;
  } catch (error) {
    console.error('Error getting bills by room and date range:', error);
    throw error;
  }
});

ipcMain.handle('get-bill-by-id', async (event, billId) => {
  try {
    const bill = await database.get('SELECT * FROM bills WHERE id = ?', [billId]);
    return bill;
  } catch (error) {
    console.error('Error getting bill by ID:', error);
    throw error;
  }
});

ipcMain.handle('create-bill', async (event, billData) => {
  try {
    const result = await database.run(
      'INSERT INTO bills (room_id, room_cost, electric_cost, water_cost, total_cost, bill_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [billData.room_id, billData.room_cost, billData.electric_cost, billData.water_cost, billData.total_cost, billData.bill_date, billData.due_date, billData.status]
    );
    return { id: result.lastID };
  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
});

ipcMain.handle('update-bill', async (event, billId, billData) => {
  try {
    await database.run(
      'UPDATE bills SET room_id = ?, room_cost = ?, electric_cost = ?, water_cost = ?, total_cost = ?, bill_date = ?, due_date = ?, status = ? WHERE id = ?',
      [billData.room_id, billData.room_cost, billData.electric_cost, billData.water_cost, billData.total_cost, billData.bill_date, billData.due_date, billData.status, billId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating bill:', error);
    throw error;
  }
});

ipcMain.handle('delete-bill', async (event, billId) => {
  try {
    await database.run('DELETE FROM bills WHERE id = ?', [billId]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting bill:', error);
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