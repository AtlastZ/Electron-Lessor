// Remove theme import and update the room rendering to use CSS classes
function getStatusClass(status) {
  return status || 'default';
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
    roomList.innerHTML = '<tr><td colspan="3" class="loading">Loading rooms...</td></tr>';

    // Get rooms from database through IPC
    console.log('Requesting rooms from main process...');
    const rooms = await window.electronAPI.getRooms();
    console.log('Rooms received:', rooms);
    
    if (!rooms || rooms.length === 0) {
      console.log('No rooms found');
      roomList.innerHTML = '<tr><td colspan="3" class="no-rooms">No rooms available</td></tr>';
      return;
    }

    // Render rooms in table format
    roomList.innerHTML = rooms.map(room => `
      <tr>
        <td>${room.name}</td>
        <td>
          <span class="status-badge ${getStatusClass(room.status)}">
            ${room.status}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn view-btn" onclick="viewRoom(${room.id})">View</button>
            <button class="action-btn edit-btn" onclick="editRoom(${room.id})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteRoom(${room.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading rooms:', error);
    const roomList = document.getElementById('roomList');
    if (roomList) {
      roomList.innerHTML = '<tr><td colspan="3" class="error">Error loading rooms. Please try again.</td></tr>';
    }
  }
}

// Function to view room details
function viewRoom(roomId) {
  window.location.href = `roomDetails.html?id=${roomId}`;
}

// Function to edit room
async function editRoom(roomId) {
  try {
    // TODO: Implement edit room functionality
    console.log('Editing room:', roomId);
  } catch (error) {
    console.error('Error editing room:', error);
    alert('Failed to edit room. Please try again.');
  }
}

// Function to delete room
async function deleteRoom(roomId) {
  try {
    if (confirm('Are you sure you want to delete this room?')) {
      // TODO: Implement delete room functionality
      console.log('Deleting room:', roomId);
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    alert('Failed to delete room. Please try again.');
  }
}

// Function to add new room
async function addNewRoom() {
  try {
    // TODO: Implement add room functionality
    console.log('Adding new room...');
    // For now, we'll just redirect to roomDetails.html without an ID
    window.location.href = 'roomDetails.html';
  } catch (error) {
    console.error('Error adding new room:', error);
    alert('Failed to add new room. Please try again.');
  }
}

// Make functions available globally for onclick handlers
window.viewRoom = viewRoom;
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.addNewRoom = addNewRoom;

// Load rooms when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRooms();
  
  // Add event listener for the new room button
  const addRoomBtn = document.getElementById('addRoomBtn');
  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', addNewRoom);
  }
}); 