const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRooms: () => ipcRenderer.invoke('get-rooms'),
  getRoomById: (roomId) => ipcRenderer.invoke('get-room-by-id', roomId),
  bookRoom: (roomId) => ipcRenderer.invoke('book-room', roomId)
}); 