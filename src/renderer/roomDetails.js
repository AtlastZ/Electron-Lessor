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

    if (!roomId) {
      throw new Error('Room ID not provided');
    }

    // Get room details from database through IPC
    const room = await window.electronAPI.getRoomById(roomId);
    
    if (!room) {
      throw new Error('Room not found');
    }

    // Format the date
    const createdAt = new Date(room.created_at).toLocaleString();
    
    // Update page content
    document.getElementById('roomName').textContent = room.name;
    document.getElementById('status').innerHTML = `
      <span class="status-badge ${getStatusClass(room.status)}">
        ${room.status}
      </span>
    `;
    document.getElementById('description').textContent = room.description || 'No description available';
    document.getElementById('price').textContent = formatPrice(room.price);
    document.getElementById('createdAt').textContent = createdAt;

  } catch (error) {
    console.error('Error loading room details:', error);
    alert('Failed to load room details. Please try again.');
    goBack();
  }
}

function goBack() {
  window.location.href = 'index.html';
}

// Make goBack available globally for onclick handler
window.goBack = goBack;

// Load room details when the page loads
document.addEventListener('DOMContentLoaded', loadRoomDetails); 