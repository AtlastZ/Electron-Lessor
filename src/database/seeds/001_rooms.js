const database = require('../config');

async function up() {
  // Check if rooms table is empty
  const count = await database.get('SELECT COUNT(*) as count FROM rooms');
  
  if (count.count === 0) {
    const mockRooms = [
      ['Room 101', 'Standard room with city view', 199.99, 'available'],
      ['Room 102', 'Standard room with city view', 199.99, 'available'],
      ['Room 103', 'Standard room with city view', 199.99, 'occupied'],
      ['Room 201', 'Deluxe room with ocean view', 299.99, 'available'],
      ['Room 202', 'Deluxe room with ocean view', 299.99, 'maintenance'],
      ['Room 301', 'Suite with separate living area', 399.99, 'available'],
      ['Room 302', 'Suite with separate living area', 399.99, 'available'],
      ['Room 303', 'Suite with separate living area', 399.99, 'occupied']
    ];

    const stmt = database.db.prepare('INSERT INTO rooms (name, description, price, status) VALUES (?, ?, ?, ?)');
    
    for (const room of mockRooms) {
      await database.run('INSERT INTO rooms (name, description, price, status) VALUES (?, ?, ?, ?)', room);
    }
    
    stmt.finalize();
  }
}

async function down() {
  await database.run('DELETE FROM rooms');
}

module.exports = {
  up,
  down
}; 