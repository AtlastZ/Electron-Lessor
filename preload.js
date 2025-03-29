const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRooms: () => ipcRenderer.invoke('get-rooms'),
  bookRoom: (roomId) => ipcRenderer.invoke('book-room', roomId)
}); 