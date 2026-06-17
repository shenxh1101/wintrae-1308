const path = require('path')
const fs = require('fs')
const { ipcMain } = require('electron')
const dayjs = require('dayjs')

let data = {
  students: [],
  works: [],
  kilns: [],
  fees: [],
  reminders: []
}

let nextIds = {
  students: 1,
  works: 1,
  kilns: 1,
  fees: 1,
  reminders: 1
}

let dataFilePath = ''

function getUserDataPath() {
  const appData = process.env.APPDATA || process.env.HOME || process.env.USERPROFILE
  const dir = path.join(appData, 'PotteryStudioManager')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

function now() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

function saveData() {
  try {
    const saveData = { data, nextIds }
    fs.writeFileSync(dataFilePath, JSON.stringify(saveData, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save data:', err)
  }
}

function loadData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8')
      const saved = JSON.parse(content)
      data = saved.data || data
      nextIds = saved.nextIds || nextIds
      console.log('Data loaded from:', dataFilePath)
    } else {
      console.log('No existing data file, starting fresh')
    }
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      dataFilePath = path.join(getUserDataPath(), 'pottery_data.json')
      loadData()
      initIpcHandlers()
      console.log('Database initialized at:', dataFilePath)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

function getDb() {
  return data
}

function createWhereClause(rows, whereClause, params) {
  if (!whereClause) return rows
  
  const conditions = whereClause.toLowerCase().split('where')[1]?.trim()
  if (!conditions) return rows
  
  return rows.filter(row => {
    const simpleConditions = conditions.split('and').map(c => c.trim())
    return simpleConditions.every(cond => {
      if (cond.includes('=')) {
        const [field, val] = cond.split('=').map(s => s.trim())
        const fieldName = field.replace(/`/g, '')
        const paramIndex = val.indexOf('?')
        if (paramIndex >= 0) {
          const idx = (cond.match(/\?/g) || []).reduce((acc, _, i) => i, 0)
          const paramVal = params[idx]
          return row[fieldName] == paramVal
        }
        return row[fieldName] == val.replace(/'/g, '')
      }
      if (cond.includes(' not in ')) {
        const [field, inPart] = cond.split(' not in ').map(s => s.trim())
        const fieldName = field.replace(/`/g, '')
        const inValues = inPart.match(/\(([^)]+)\)/)[1].split(',').map(s => s.trim().replace(/'/g, ''))
        const subQuery = inValues[0]
        if (subQuery.startsWith('select')) {
          const subMatch = subQuery.match(/select\s+(\w+)\s+from\s+(\w+)/i)
          if (subMatch) {
            const subField = subMatch[1]
            const subTable = subMatch[2]
            const subIds = (data[subTable] || []).map(item => item[subField])
            return !subIds.includes(row[fieldName])
          }
        }
        return !inValues.includes(String(row[fieldName]))
      }
      return true
    })
  })
}

function initIpcHandlers() {
  ipcMain.handle('db:getAll', async (_, table) => {
    return [...(data[table] || [])].sort((a, b) => b.id - a.id)
  })

  ipcMain.handle('db:getById', async (_, table, id) => {
    return (data[table] || []).find(item => item.id === id) || null
  })

  ipcMain.handle('db:create', async (_, table, dataObj) => {
    if (!data[table]) data[table] = []
    
    const newItem = {
      id: nextIds[table],
      ...dataObj,
      created_at: now(),
      updated_at: now()
    }
    
    data[table].push(newItem)
    nextIds[table]++
    saveData()
    
    return newItem
  })

  ipcMain.handle('db:update', async (_, table, id, dataObj) => {
    const items = data[table] || []
    const index = items.findIndex(item => item.id === id)
    
    if (index >= 0) {
      items[index] = {
        ...items[index],
        ...dataObj,
        id,
        updated_at: now()
      }
      saveData()
      return { success: true }
    }
    return { success: false }
  })

  ipcMain.handle('db:delete', async (_, table, id) => {
    const items = data[table] || []
    const index = items.findIndex(item => item.id === id)
    
    if (index >= 0) {
      items.splice(index, 1)
      saveData()
      return { success: true }
    }
    return { success: false }
  })

  ipcMain.handle('db:query', async (_, sql, params = []) => {
    const sqlUpper = sql.trim().toUpperCase()
    
    if (sqlUpper.startsWith('SELECT')) {
      const tableMatch = sql.match(/FROM\s+(\w+)/i)
      if (!tableMatch) return []
      
      const table = tableMatch[1]
      let rows = [...(data[table] || [])]
      
      const whereMatch = sql.match(/WHERE\s+(.+?)(ORDER|LIMIT|$)/i)
      if (whereMatch) {
        rows = createWhereClause(rows, 'WHERE ' + whereMatch[1], params)
      }
      
      const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(LIMIT|$)/i)
      if (orderMatch) {
        const orderParts = orderMatch[1].trim().split(/\s+/)
        const orderField = orderParts[0].replace(/`/g, '')
        const orderDir = (orderParts[1] || 'ASC').toUpperCase()
        rows.sort((a, b) => {
          const av = a[orderField]
          const bv = b[orderField]
          if (av < bv) return orderDir === 'ASC' ? -1 : 1
          if (av > bv) return orderDir === 'ASC' ? 1 : -1
          return 0
        })
      } else {
        rows.sort((a, b) => b.id - a.id)
      }
      
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i)
      if (limitMatch) {
        rows = rows.slice(0, parseInt(limitMatch[1]))
      }
      
      const countMatch = sql.match(/SELECT\s+COUNT\s*\(\s*\*\s*\)\s+AS\s+(\w+)/i)
      if (countMatch) {
        return [{ [countMatch[1]]: rows.length }]
      }
      
      return rows
    } else {
      saveData()
      return { changes: 0, lastInsertRowid: 0 }
    }
  })
}

module.exports = { initDatabase, getDb }
