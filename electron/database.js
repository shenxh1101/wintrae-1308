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
      migrateData()
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

function migrateData() {
  data.kilns = data.kilns.map(k => ({
    capacity: 20,
    ...k
  }))
  data.works = data.works.map(w => ({
    kiln_id: null,
    previous_status: null,
    ...w
  }))
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

  ipcMain.handle('kiln:addWorks', async (_, kilnId, workIds, targetStatus) => {
    const kiln = data.kilns.find(k => k.id === kilnId)
    if (!kiln) return { success: false, message: '窑炉不存在' }
    
    const currentWorks = data.works.filter(w => w.kiln_id === kilnId).length
    const availableCapacity = kiln.capacity - currentWorks
    
    if (workIds.length > availableCapacity) {
      return { success: false, message: `窑炉容量不足，还可容纳 ${availableCapacity} 件作品` }
    }
    
    const today = dayjs().format('YYYY-MM-DD')
    workIds.forEach(workId => {
      const work = data.works.find(w => w.id === workId)
      if (work) {
        work.previous_status = work.status
        work.status = targetStatus
        work.kiln_id = kilnId
        work.updated_at = now()
        
        if (targetStatus === 'bisque' && !work.bisque_date) {
          work.bisque_date = today
        } else if (targetStatus === 'glaze_fire' && !work.glaze_fire_date) {
          work.glaze_fire_date = today
        }
      }
    })
    
    if (kiln.status === 'scheduled') {
      const totalWorks = data.works.filter(w => w.kiln_id === kilnId).length
      if (totalWorks >= kiln.capacity) {
        kiln.status = 'full'
        kiln.updated_at = now()
      }
    }
    
    saveData()
    return { success: true, message: `成功添加 ${workIds.length} 件作品到窑炉` }
  })

  ipcMain.handle('kiln:removeWork', async (_, kilnId, workId) => {
    const work = data.works.find(w => w.id === workId)
    const kiln = data.kilns.find(k => k.id === kilnId)
    
    if (!work || work.kiln_id !== kilnId) {
      return { success: false, message: '作品不存在或不在此窑炉中' }
    }
    
    if (work.previous_status) {
      work.status = work.previous_status
    }
    work.kiln_id = null
    work.previous_status = null
    work.updated_at = now()
    
    if (kiln && kiln.status === 'full') {
      kiln.status = 'scheduled'
      kiln.updated_at = now()
    }
    
    saveData()
    return { success: true, message: '作品已从窑炉中移除' }
  })

  ipcMain.handle('kiln:complete', async (_, kilnId) => {
    const kiln = data.kilns.find(k => k.id === kilnId)
    if (!kiln) return { success: false, message: '窑炉不存在' }
    
    const works = data.works.filter(w => w.kiln_id === kilnId)
    const today = dayjs().format('YYYY-MM-DD')
    
    works.forEach(work => {
      if (work.status === 'bisque') {
        work.status = 'glaze'
        work.bisque_date = work.bisque_date || today
      } else if (work.status === 'glaze_fire') {
        work.status = 'ready'
        work.glaze_fire_date = work.glaze_fire_date || today
        work.ready_date = today
        
        const student = data.students.find(s => s.id === work.student_id)
        if (student) {
          const message = `【陶艺工作室】尊敬的${student.name}您好，您的作品「${work.name}」已烧制完成，可以来取件啦！`
          data.reminders.push({
            id: nextIds.reminders++,
            work_id: work.id,
            student_id: work.student_id,
            message,
            contacted: 0,
            contact_date: null,
            created_at: now()
          })
        }
      }
      work.kiln_id = null
      work.previous_status = null
      work.updated_at = now()
    })
    
    kiln.status = 'completed'
    kiln.updated_at = now()
    
    saveData()
    return { success: true, message: `窑炉烧制完成，${works.length} 件作品已流转到下一状态` }
  })

  ipcMain.handle('kiln:cancel', async (_, kilnId) => {
    const kiln = data.kilns.find(k => k.id === kilnId)
    if (!kiln) return { success: false, message: '窑炉不存在' }
    
    const works = data.works.filter(w => w.kiln_id === kilnId)
    
    works.forEach(work => {
      if (work.previous_status) {
        work.status = work.previous_status
      }
      work.kiln_id = null
      work.previous_status = null
      work.updated_at = now()
    })
    
    kiln.status = 'cancelled'
    kiln.updated_at = now()
    
    saveData()
    return { success: true, message: `排期已取消，${works.length} 件作品已退回原状态` }
  })

  ipcMain.handle('work:getWithFees', async (_, workId) => {
    const work = data.works.find(w => w.id === workId)
    if (!work) return null
    
    const fees = data.fees.filter(f => f.work_id === workId)
    const totalPaid = fees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0)
    const totalUnpaid = fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0)
    
    return {
      ...work,
      fees,
      totalPaid,
      totalUnpaid,
      hasDebt: totalUnpaid > 0
    }
  })

  ipcMain.handle('fee:calculate', async (_, workId, feeType, temperature) => {
    const work = data.works.find(w => w.id === workId)
    if (!work) return { success: false, amount: 0 }
    
    let amount = 0
    let sizeFactor = 1
    
    if (work.size) {
      const sizeMatch = work.size.match(/(\d+(?:\.\d+)?)\s*cm/i)
      if (sizeMatch) {
        const maxDim = parseFloat(sizeMatch[1])
        if (maxDim > 30) sizeFactor = 2.5
        else if (maxDim > 20) sizeFactor = 1.8
        else if (maxDim > 10) sizeFactor = 1.3
      }
    }
    
    if (feeType === 'material') {
      amount = 50 * sizeFactor
    } else if (feeType === 'firing') {
      const temp = temperature || 1180
      let tempFactor = 1
      if (temp >= 1240) tempFactor = 1.5
      else if (temp >= 1180) tempFactor = 1.2
      
      if (work.status === 'bisque' || work.previous_status === 'clay') {
        amount = 20 * sizeFactor * tempFactor
      } else {
        amount = 30 * sizeFactor * tempFactor
      }
    } else if (feeType === 'makeup') {
      amount = 50
    }
    
    return { success: true, amount: Math.round(amount * 100) / 100 }
  })

  ipcMain.handle('student:getStats', async (_, studentId) => {
    const works = data.works.filter(w => w.student_id === studentId)
    const inProgress = works.filter(w => w.status !== 'picked').length
    const fees = data.fees.filter(f => f.student_id === studentId)
    const totalDebt = fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0)
    
    return {
      inProgress,
      totalWorks: works.length,
      totalDebt,
      hasDebt: totalDebt > 0
    }
  })
}

module.exports = { initDatabase, getDb }
