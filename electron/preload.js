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
  },
  kiln: {
    addWorks: (kilnId, workIds, targetStatus) => ipcRenderer.invoke('kiln:addWorks', kilnId, workIds, targetStatus),
    removeWork: (kilnId, workId) => ipcRenderer.invoke('kiln:removeWork', kilnId, workId),
    complete: (kilnId) => ipcRenderer.invoke('kiln:complete', kilnId),
    cancel: (kilnId) => ipcRenderer.invoke('kiln:cancel', kilnId)
  },
  work: {
    getWithFees: (workId) => ipcRenderer.invoke('work:getWithFees', workId)
  },
  fee: {
    calculate: (workId, feeType, temperature) => ipcRenderer.invoke('fee:calculate', workId, feeType, temperature)
  },
  student: {
    getStats: (studentId) => ipcRenderer.invoke('student:getStats', studentId)
  }
})
