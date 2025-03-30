function getStatusClass(status) {
  return status || 'default';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

async function loadBillHistory(roomId) {
  try {
    const billHistory = document.getElementById('billHistory');
    if (!billHistory) {
      console.error('Bill history element not found');
      return;
    }

    // Show loading state
    billHistory.innerHTML = '<tr><td colspan="8" class="loading">Loading bill history...</td></tr>';

    // Get bills for this room
    const bills = await window.electronAPI.getBillsByRoom(roomId);
    
    if (!bills || bills.length === 0) {
      billHistory.innerHTML = '<tr><td colspan="8" class="no-bills">No billing history available</td></tr>';
      return;
    }

    // Render bills in table format
    billHistory.innerHTML = bills.map(bill => `
      <tr>
        <td>${formatDate(bill.bill_date)}</td>
        <td>${formatDate(bill.due_date)}</td>
        <td>${formatPrice(bill.room_cost)}</td>
        <td>${formatPrice(bill.electric_cost)}</td>
        <td>${formatPrice(bill.water_cost)}</td>
        <td>${formatPrice(bill.total_cost)}</td>
        <td>
          <span class="status-badge ${bill.status}">
            ${bill.status}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn view-btn" onclick="viewBill(${bill.id})">View</button>
            <button class="action-btn edit-btn" onclick="editBill(${bill.id})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteBill(${bill.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading bill history:', error);
    const billHistory = document.getElementById('billHistory');
    if (billHistory) {
      billHistory.innerHTML = '<tr><td colspan="8" class="error">Error loading bill history. Please try again.</td></tr>';
    }
  }
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
      document.getElementById('waterUnit').value = '0';
      document.getElementById('waterCostPerUnit').value = '0';
      document.getElementById('electricUnit').value = '0';
      document.getElementById('electricCostPerUnit').value = '0';
      document.getElementById('createdAt').textContent = new Date().toLocaleString();
      document.getElementById('saveBtn').textContent = 'Create Room';
      document.getElementById('pageTitle').textContent = 'Create New Room';
      document.getElementById('createBillBtn').style.display = 'none';
      document.querySelector('.billing-history-container').style.display = 'none';
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
    document.getElementById('waterUnit').value = room.water_unit;
    document.getElementById('waterCostPerUnit').value = room.water_cost_per_unit;
    document.getElementById('electricUnit').value = room.electric_unit;
    document.getElementById('electricCostPerUnit').value = room.electric_cost_per_unit;
    document.getElementById('createdAt').textContent = createdAt;
    document.getElementById('saveBtn').textContent = 'Update Room';
    document.getElementById('pageTitle').textContent = 'Edit Room';
    
    // Show create bill button and billing history for existing rooms
    document.getElementById('createBillBtn').style.display = 'flex';
    document.querySelector('.billing-history-container').style.display = 'block';
    
    // Load billing history
    await loadBillHistory(roomId);

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
      price: parseFloat(document.getElementById('price').value),
      water_unit: parseFloat(document.getElementById('waterUnit').value),
      water_cost_per_unit: parseFloat(document.getElementById('waterCostPerUnit').value),
      electric_unit: parseFloat(document.getElementById('electricUnit').value),
      electric_cost_per_unit: parseFloat(document.getElementById('electricCostPerUnit').value)
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

async function createBill() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (!roomId) {
      throw new Error('Room ID not found');
    }

    // Get room details
    const room = await window.electronAPI.getRoomById(roomId);
    
    // Check if bill already exists for this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const existingBills = await window.electronAPI.getBillsByRoomAndDateRange(roomId, firstDayOfMonth.toISOString(), lastDayOfMonth.toISOString());
    
    if (existingBills && existingBills.length > 0) {
      if (confirm('A bill already exists for this month. Would you like to create another one?')) {
        await createNewBill(room);
      }
    } else {
      await createNewBill(room);
    }
  } catch (error) {
    console.error('Error creating bill:', error);
    alert('Failed to create bill. Please try again.');
  }
}

async function createNewBill(room) {
  const currentDate = new Date();
  const dueDate = new Date(currentDate);
  dueDate.setDate(dueDate.getDate() + 30); // Set due date to 30 days from now

  const billData = {
    room_id: room.id,
    room_cost: room.price,
    electric_cost: 0,
    water_cost: 0,
    total_cost: room.price,
    bill_date: currentDate.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    status: 'pending'
  };

  await window.electronAPI.createBill(billData);
  alert('Bill created successfully!');
}

function goBack() {
  window.location.href = 'index.html';
}

// Add these new functions
function viewBill(billId) {
  window.location.href = `billDetails.html?id=${billId}`;
}

function editBill(billId) {
  window.location.href = `billDetails.html?id=${billId}`;
}

async function deleteBill(billId) {
  try {
    if (confirm('Are you sure you want to delete this bill?')) {
      await window.electronAPI.deleteBill(billId);
      const urlParams = new URLSearchParams(window.location.search);
      const roomId = urlParams.get('id');
      if (roomId) {
        await loadBillHistory(roomId);
      }
    }
  } catch (error) {
    console.error('Error deleting bill:', error);
    alert('Failed to delete bill. Please try again.');
  }
}

// Make functions available globally for onclick handlers
window.goBack = goBack;
window.saveRoom = saveRoom;
window.createBill = createBill;
window.viewBill = viewBill;
window.editBill = editBill;
window.deleteBill = deleteBill;

// Load room details when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRoomDetails();
  
  // Add event listener for the create bill button
  const createBillBtn = document.getElementById('createBillBtn');
  if (createBillBtn) {
    createBillBtn.addEventListener('click', createBill);
  }
}); 