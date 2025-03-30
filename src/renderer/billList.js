function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

async function loadBills() {
  try {
    const billList = document.getElementById('billList');
    if (!billList) {
      console.error('Bill list element not found');
      return;
    }

    // Show loading state
    billList.innerHTML = '<tr><td colspan="6" class="loading">Loading bills...</td></tr>';

    // Get bills from database through IPC
    const bills = await window.electronAPI.getBills();
    
    if (!bills || bills.length === 0) {
      billList.innerHTML = '<tr><td colspan="6" class="no-bills">No bills available</td></tr>';
      return;
    }

    // Render bills in table format
    billList.innerHTML = bills.map(bill => `
      <tr>
        <td>${bill.room_name}</td>
        <td>${formatDate(bill.bill_date)}</td>
        <td>${formatDate(bill.due_date)}</td>
        <td>${formatCurrency(bill.total_cost)}</td>
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
    console.error('Error loading bills:', error);
    const billList = document.getElementById('billList');
    if (billList) {
      billList.innerHTML = '<tr><td colspan="6" class="error">Error loading bills. Please try again.</td></tr>';
    }
  }
}

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
      loadBills();
    }
  } catch (error) {
    console.error('Error deleting bill:', error);
    alert('Failed to delete bill. Please try again.');
  }
}

function addNewBill() {
  window.location.href = 'billDetails.html';
}

function goBack() {
  window.location.href = 'index.html';
}

// Make functions available globally for onclick handlers
window.viewBill = viewBill;
window.editBill = editBill;
window.deleteBill = deleteBill;
window.addNewBill = addNewBill;
window.goBack = goBack;

// Load bills when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadBills();
  
  // Add event listener for the new bill button
  const addBillBtn = document.getElementById('addBillBtn');
  if (addBillBtn) {
    addBillBtn.addEventListener('click', addNewBill);
  }
}); 