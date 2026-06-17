const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { initDatabase, getDb } = require('./database')

let mainWindow = null

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development'
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 768,
    title: '陶艺工作室管理系统',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    await initDatabase()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (err) {
    console.error('Failed to initialize database:', err)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    const imageBuffer = fs.readFileSync(filePath)
    const base64 = imageBuffer.toString('base64')
    const ext = path.extname(filePath).slice(1)
    return `data:image/${ext};base64,${base64}`
  }
  return null
})
