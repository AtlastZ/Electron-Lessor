function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function calculateTotal() {
  const roomCost = parseFloat(document.getElementById('roomCost').value) || 0;
  const electricCost = parseFloat(document.getElementById('electricCost').value) || 0;
  const waterCost = parseFloat(document.getElementById('waterCost').value) || 0;
  const total = roomCost + electricCost + waterCost;
  document.getElementById('totalCost').textContent = formatCurrency(total);
}

async function loadBillDetails() {
  try {
    // Get bill ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');
    const isNewBill = !billId;

    // Load available rooms
    const rooms = await window.electronAPI.getRooms();
    const roomSelect = document.getElementById('roomId');
    roomSelect.innerHTML = rooms.map(room => 
      `<option value="${room.id}">${room.name}</option>`
    ).join('');

    if (isNewBill) {
      // Show empty form for new bill
      document.getElementById('roomCost').value = '';
      document.getElementById('electricCost').value = '';
      document.getElementById('waterCost').value = '';
      document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('dueDate').value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      document.getElementById('status').value = 'pending';
      document.getElementById('saveBtn').textContent = 'Create Bill';
      document.getElementById('pageTitle').textContent = 'Create New Bill';
      calculateTotal();
      return;
    }

    // Get bill details from database through IPC
    const bill = await window.electronAPI.getBillById(billId);
    
    if (!bill) {
      throw new Error('Bill not found');
    }
    
    // Update form fields
    document.getElementById('roomId').value = bill.room_id;
    document.getElementById('roomCost').value = bill.room_cost;
    document.getElementById('electricCost').value = bill.electric_cost;
    document.getElementById('waterCost').value = bill.water_cost;
    document.getElementById('billDate').value = bill.bill_date;
    document.getElementById('dueDate').value = bill.due_date;
    document.getElementById('status').value = bill.status;
    document.getElementById('saveBtn').textContent = 'Update Bill';
    document.getElementById('pageTitle').textContent = 'Edit Bill';
    calculateTotal();

  } catch (error) {
    console.error('Error loading bill details:', error);
    alert('Failed to load bill details. Please try again.');
    goBack();
  }
}

async function saveBill() {
  try {
    const billData = {
      room_id: parseInt(document.getElementById('roomId').value),
      room_cost: parseFloat(document.getElementById('roomCost').value),
      electric_cost: parseFloat(document.getElementById('electricCost').value),
      water_cost: parseFloat(document.getElementById('waterCost').value),
      total_cost: parseFloat(document.getElementById('totalCost').textContent.replace(/[^0-9.-]+/g, '')),
      bill_date: document.getElementById('billDate').value,
      due_date: document.getElementById('dueDate').value,
      status: document.getElementById('status').value
    };

    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('id');

    if (billId) {
      // Update existing bill
      await window.electronAPI.updateBill(billId, billData);
    } else {
      // Create new bill
      await window.electronAPI.createBill(billData);
    }

    // Redirect back to bill list
    goBack();
  } catch (error) {
    console.error('Error saving bill:', error);
    alert('Failed to save bill. Please try again.');
  }
}

function goBack() {
  window.location.href = 'bills.html';
}

// Make functions available globally for onclick handlers
window.goBack = goBack;
window.saveBill = saveBill;

// Add event listeners for cost inputs
document.addEventListener('DOMContentLoaded', () => {
  loadBillDetails();
  
  // Add event listeners for cost inputs to update total
  ['roomCost', 'electricCost', 'waterCost'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateTotal);
  });
}); 