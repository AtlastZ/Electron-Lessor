const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRooms: () => ipcRenderer.invoke('get-rooms'),
  getRoomById: (roomId) => ipcRenderer.invoke('get-room-by-id', roomId),
  bookRoom: (roomId) => ipcRenderer.invoke('book-room', roomId),
  createRoom: (roomData) => ipcRenderer.invoke('create-room', roomData),
  updateRoom: (roomId, roomData) => ipcRenderer.invoke('update-room', roomId, roomData),
  // Bill-related functions
  getBills: () => ipcRenderer.invoke('get-bills'),
  getBillById: (billId) => ipcRenderer.invoke('get-bill-by-id', billId),
  createBill: (billData) => ipcRenderer.invoke('create-bill', billData),
  updateBill: (billId, billData) => ipcRenderer.invoke('update-bill', billId, billData),
  deleteBill: (billId) => ipcRenderer.invoke('delete-bill', billId),
  getBillsByRoomAndDateRange: (roomId, startDate, endDate) => 
    ipcRenderer.invoke('get-bills-by-room-and-date-range', roomId, startDate, endDate),
  getBillsByRoom: (roomId) => ipcRenderer.invoke('get-bills-by-room', roomId)
}); 