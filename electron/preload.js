const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectImage: () => ipcRenderer.invoke('select-image'),
  database: {
    getAll: (table) => ipcRenderer.invoke('db:getAll', table),
    getById: (table, id) => ipcRenderer.invoke('db:getById', table, id),
    create: (table, data) => ipcRenderer.invoke('db:create', table, data),
    update: (table, id, data) => ipcRenderer.invoke('db:update', table, id, data),
    delete: (table, id) => ipcRenderer.invoke('db:delete', table, id),
    query: (sql, params) => ipcRenderer.invoke('db:query', sql, params)
  }
})
