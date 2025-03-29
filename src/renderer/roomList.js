function getStatusColor(status) {
  switch (status) {
    case 'available':
      return '#4CAF50'; // Green
    case 'occupied':
      return '#F44336'; // Red
    case 'maintenance':
      return '#FF9800'; // Orange
    default:
      return '#9E9E9E'; // Grey
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

async function loadRooms() {
  try {
    console.log('Starting to load rooms...');
    const roomList = document.getElementById('roomList');
    if (!roomList) {
      console.error('Room list element not found');
      return;
    }

    // Show loading state
    roomList.innerHTML = '<div class="loading">Loading rooms...</div>';

    // Get rooms from database through IPC
    console.log('Requesting rooms from main process...');
    const rooms = await window.electronAPI.getRooms();
    console.log('Rooms received:', rooms);
    
    if (!rooms || rooms.length === 0) {
      console.log('No rooms found');
      roomList.innerHTML = '<div class="no-rooms">No rooms available</div>';
      return;
    }

    // Group rooms by floor
    const roomsByFloor = rooms.reduce((acc, room) => {
      const floor = room.name.split(' ')[1][0];
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(room);
      return acc;
    }, {});

    console.log('Rooms grouped by floor:', roomsByFloor);

    // Render rooms by floor
    roomList.innerHTML = Object.entries(roomsByFloor)
      .sort(([a], [b]) => a - b)
      .map(([floor, floorRooms]) => `
        <div class="floor-section">
          <h2>Floor ${floor}</h2>
          <div class="floor-rooms">
            ${floorRooms.map(room => `
              <div class="room-card">
                <div class="room-header">
                  <h3>${room.name}</h3>
                  <span class="status-badge" style="background-color: ${getStatusColor(room.status)}">
                    ${room.status}
                  </span>
                </div>
                <p class="description">${room.description}</p>
                <div class="room-footer">
                  <span class="price">${formatPrice(room.price)}</span>
                  <button class="book-btn" onclick="bookRoom(${room.id})" ${room.status !== 'available' ? 'disabled' : ''}>
                    ${room.status === 'available' ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading rooms:', error);
    const roomList = document.getElementById('roomList');
    if (roomList) {
      roomList.innerHTML = '<div class="error">Error loading rooms. Please try again.</div>';
    }
  }
}

// Function to handle room booking
async function bookRoom(roomId) {
  try {
    await window.electronAPI.bookRoom(roomId);
    // Reload the room list to show updated status
    await loadRooms();
  } catch (error) {
    console.error('Error booking room:', error);
    alert('Failed to book room. Please try again.');
  }
}

// Make bookRoom available globally for onclick handlers
window.bookRoom = bookRoom;

// Load rooms when the page loads
document.addEventListener('DOMContentLoaded', loadRooms); 