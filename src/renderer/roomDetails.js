function getStatusClass(status) {
  return status || 'default';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

async function loadRoomDetails() {
  try {
    // Get room ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    const isNewRoom = !roomId;

    if (isNewRoom) {
      // Show empty form for new room
      document.getElementById('roomName').value = '';
      document.getElementById('status').value = 'available';
      document.getElementById('description').value = '';
      document.getElementById('price').value = '';
      document.getElementById('createdAt').textContent = new Date().toLocaleString();
      document.getElementById('saveBtn').textContent = 'Create Room';
      document.getElementById('pageTitle').textContent = 'Create New Room';
      return;
    }

    // Get room details from database through IPC
    const room = await window.electronAPI.getRoomById(roomId);
    
    if (!room) {
      throw new Error('Room not found');
    }

    // Format the date
    const createdAt = new Date(room.created_at).toLocaleString();
    
    // Update form fields
    document.getElementById('roomName').value = room.name;
    document.getElementById('status').value = room.status;
    document.getElementById('description').value = room.description || '';
    document.getElementById('price').value = room.price;
    document.getElementById('createdAt').textContent = createdAt;
    document.getElementById('saveBtn').textContent = 'Update Room';
    document.getElementById('pageTitle').textContent = 'Edit Room';

  } catch (error) {
    console.error('Error loading room details:', error);
    alert('Failed to load room details. Please try again.');
    goBack();
  }
}

async function saveRoom() {
  try {
    const roomData = {
      name: document.getElementById('roomName').value,
      status: document.getElementById('status').value,
      description: document.getElementById('description').value,
      price: parseFloat(document.getElementById('price').value)
    };

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (roomId) {
      // Update existing room
      await window.electronAPI.updateRoom(roomId, roomData);
    } else {
      // Create new room
      await window.electronAPI.createRoom(roomData);
    }

    // Redirect back to room list
    goBack();
  } catch (error) {
    console.error('Error saving room:', error);
    alert('Failed to save room. Please try again.');
  }
}

function goBack() {
  window.location.href = 'index.html';
}

// Make functions available globally for onclick handlers
window.goBack = goBack;
window.saveRoom = saveRoom;

// Load room details when the page loads
document.addEventListener('DOMContentLoaded', loadRoomDetails); 