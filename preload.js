const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRooms: () => ipcRenderer.invoke('get-rooms'),
  getRoomById: (roomId) => ipcRenderer.invoke('get-room-by-id', roomId),
  bookRoom: (roomId) => ipcRenderer.invoke('book-room', roomId),
  createRoom: (roomData) => ipcRenderer.invoke('create-room', roomData),
  updateRoom: (roomId, roomData) => ipcRenderer.invoke('update-room', roomId, roomData)
}); 