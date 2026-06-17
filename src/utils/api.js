let mockData = {
  students: [
    { id: 1, name: '张三', phone: '13800138001', wechat: 'zhangsan_wx', course_count: 10, used_count: 3, preferred_glaze: '#409eff', notes: '喜欢蓝色系', created_at: '2024-01-15 10:30:00' },
    { id: 2, name: '李四', phone: '13800138002', wechat: 'lisi_wx', course_count: 5, used_count: 5, preferred_glaze: '#67c23a', notes: '已用完课时', created_at: '2024-01-20 14:20:00' },
    { id: 3, name: '王五', phone: '13800138003', wechat: 'wangwu_wx', course_count: 20, used_count: 8, preferred_glaze: '#e6a23c', notes: '', created_at: '2024-02-01 09:15:00' }
  ],
  works: [
    { id: 1, student_id: 1, name: '青花茶杯', status: 'clay', kiln_id: null, previous_status: null, photo: '', size: '高8cm 直径6cm', fragile: 1, teacher: '李老师', glaze_color: '#409eff', notes: '薄胎，注意轻拿轻放', clay_date: '2024-06-15', bisque_date: '', glaze_date: '', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-15 10:00:00' },
    { id: 2, student_id: 1, name: '手拉坯花瓶', status: 'bisque', kiln_id: null, previous_status: null, photo: '', size: '高20cm 直径10cm', fragile: 0, teacher: '李老师', glaze_color: '', notes: '', clay_date: '2024-06-10', bisque_date: '2024-06-12', glaze_date: '', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-10 11:00:00' },
    { id: 3, student_id: 3, name: '陶瓷盘子', status: 'glaze', kiln_id: null, previous_status: null, photo: '', size: '直径25cm', fragile: 0, teacher: '王老师', glaze_color: '#e6a23c', notes: '釉下彩', clay_date: '2024-06-05', bisque_date: '2024-06-07', glaze_date: '2024-06-14', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-05 14:00:00' },
    { id: 4, student_id: 2, name: '小茶盏', status: 'ready', kiln_id: null, previous_status: null, photo: '', size: '高4cm 直径6cm', fragile: 1, teacher: '李老师', glaze_color: '#67c23a', notes: '木叶天目', clay_date: '2024-06-01', bisque_date: '2024-06-03', glaze_date: '2024-06-05', glaze_fire_date: '2024-06-08', ready_date: '2024-06-10', picked_date: '', created_at: '2024-06-01 10:00:00' },
    { id: 5, student_id: 3, name: '茶叶罐', status: 'glaze_fire', kiln_id: 1, previous_status: 'glaze', photo: '', size: '高12cm 直径8cm', fragile: 0, teacher: '王老师', glaze_color: '#909399', notes: '', clay_date: '2024-06-08', bisque_date: '2024-06-10', glaze_date: '2024-06-12', glaze_fire_date: '2024-06-15', ready_date: '', picked_date: '', created_at: '2024-06-08 15:00:00' },
    { id: 6, student_id: 1, name: '陶土花盆', status: 'clay', kiln_id: null, previous_status: null, photo: '', size: '高15cm 直径12cm', fragile: 0, teacher: '李老师', glaze_color: '#8B4513', notes: '', clay_date: '2024-06-16', bisque_date: '', glaze_date: '', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-16 10:00:00' },
    { id: 7, student_id: 3, name: '咖啡杯', status: 'clay', kiln_id: null, previous_status: null, photo: '', size: '高9cm 直径7cm', fragile: 0, teacher: '王老师', glaze_color: '#f57c00', notes: '', clay_date: '2024-06-17', bisque_date: '', glaze_date: '', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-17 11:00:00' },
    { id: 8, student_id: 2, name: '瓷碗', status: 'glaze', kiln_id: null, previous_status: null, photo: '', size: '直径18cm', fragile: 1, teacher: '李老师', glaze_color: '#409eff', notes: '青花图案', clay_date: '2024-06-02', bisque_date: '2024-06-04', glaze_date: '2024-06-06', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-02 10:00:00' }
  ],
  kilns: [
    { id: 1, batch_no: '20240618-A', temperature: 1240, kiln_position: 'A', capacity: 15, duration_hours: 10, scheduled_date: '2024-06-18', status: 'scheduled', notes: '高温釉烧' },
    { id: 2, batch_no: '20240615-B', temperature: 1180, kiln_position: 'B', capacity: 20, duration_hours: 8, scheduled_date: '2024-06-15', status: 'completed', notes: '中温素烧' },
    { id: 3, batch_no: '20240620-A', temperature: 1180, kiln_position: 'FULL', capacity: 20, duration_hours: 12, scheduled_date: '2024-06-20', status: 'scheduled', notes: '素烧窑' }
  ],
  fees: [
    { id: 1, student_id: 1, work_id: null, type: 'material', amount: 150.00, paid: 1, payment_date: '2024-06-01', notes: '购买泥料2包', created_at: '2024-06-01 10:00:00' },
    { id: 2, student_id: 2, work_id: 4, type: 'firing', amount: 30.00, paid: 0, payment_date: '', notes: '小茶盏烧制费', created_at: '2024-06-10 10:00:00' },
    { id: 3, student_id: 3, work_id: null, type: 'makeup', amount: 100.00, paid: 1, payment_date: '2024-06-05', notes: '补课费2课时', created_at: '2024-06-05 14:00:00' }
  ],
  reminders: [
    { id: 1, work_id: 4, student_id: 2, message: '', contacted: 0, contact_date: '', created_at: '2024-06-10 10:00:00' }
  ]
}

let nextMockId = {
  students: 4,
  works: 9,
  kilns: 4,
  fees: 4,
  reminders: 2
}

function today() {
  return new Date().toISOString().split('T')[0]
}

const isElectron = !!window.electronAPI

function now() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

const mockApi = {
  database: {
    async getAll(table) {
      return [...(mockData[table] || [])].sort((a, b) => b.id - a.id)
    },
    
    async getById(table, id) {
      return (mockData[table] || []).find(item => item.id === id) || null
    },
    
    async create(table, data) {
      if (!mockData[table]) mockData[table] = []
      const newItem = {
        id: nextMockId[table]++,
        ...data,
        created_at: now(),
        updated_at: now()
      }
      mockData[table].push(newItem)
      return newItem
    },
    
    async update(table, id, data) {
      const items = mockData[table] || []
      const index = items.findIndex(item => item.id === id)
      if (index >= 0) {
        items[index] = { ...items[index], ...data, id, updated_at: now() }
        return { success: true }
      }
      return { success: false }
    },
    
    async remove(table, id) {
      const items = mockData[table] || []
      const index = items.findIndex(item => item.id === id)
      if (index >= 0) {
        items.splice(index, 1)
        return { success: true }
      }
      return { success: false }
    },
    
    async query(sql, params = []) {
      const sqlUpper = sql.trim().toUpperCase()
      if (sqlUpper.startsWith('SELECT')) {
        const tableMatch = sql.match(/FROM\s+(\w+)/i)
        if (!tableMatch) return []
        
        const table = tableMatch[1]
        let rows = [...(mockData[table] || [])]
        
        const whereMatch = sql.match(/WHERE\s+(.+?)(ORDER|LIMIT|$)/i)
        if (whereMatch) {
          const where = whereMatch[1].toLowerCase()
          if (where.includes('status =')) {
            const statusMatch = where.match(/status\s*=\s*'([^']+)'/i)
            if (statusMatch) {
              rows = rows.filter(r => r.status === statusMatch[1])
            }
          }
          if (where.includes(' not in ')) {
            const inMatch = where.match(/(\w+)\s+not in\s*\(\s*select\s+(\w+)\s+from\s+(\w+)/i)
            if (inMatch) {
              const outerField = inMatch[1]
              const subField = inMatch[2]
              const subTable = inMatch[3]
              const subIds = (mockData[subTable] || []).map(item => item[subField])
              rows = rows.filter(r => !subIds.includes(r[outerField]))
            }
          }
          if (where.includes('student_id =')) {
            const studentMatch = where.match(/student_id\s*=\s*(\d+)/i)
            if (studentMatch) {
              rows = rows.filter(r => r.student_id === parseInt(studentMatch[1]))
            }
          }
          if (where.includes('kiln_id =')) {
            const kilnMatch = where.match(/kiln_id\s*=\s*(\d+)/i)
            if (kilnMatch) {
              rows = rows.filter(r => r.kiln_id === parseInt(kilnMatch[1]))
            }
          }
          if (where.includes('kiln_id is null')) {
            rows = rows.filter(r => r.kiln_id === null)
          }
        }
        
        const countMatch = sql.match(/SELECT\s+COUNT\s*\(\s*\*\s*\)\s+AS\s+(\w+)/i)
        if (countMatch) {
          return [{ [countMatch[1]]: rows.length }]
        }
        
        return rows.sort((a, b) => b.id - a.id)
      }
      return { changes: 0, lastInsertRowid: 0 }
    }
  },
  
  kiln: {
    async addWorks(kilnId, workIds, targetStatus) {
      const kiln = mockData.kilns.find(k => k.id === kilnId)
      if (!kiln) return { success: false, message: '窑炉不存在' }
      
      const currentWorks = mockData.works.filter(w => w.kiln_id === kilnId).length
      const availableCapacity = kiln.capacity - currentWorks
      
      if (workIds.length > availableCapacity) {
        return { success: false, message: `窑炉容量不足，还可容纳 ${availableCapacity} 件作品` }
      }
      
      const todayStr = today()
      workIds.forEach(workId => {
        const work = mockData.works.find(w => w.id === workId)
        if (work) {
          work.previous_status = work.status
          work.status = targetStatus
          work.kiln_id = kilnId
          work.updated_at = now()
          
          if (targetStatus === 'bisque' && !work.bisque_date) {
            work.bisque_date = todayStr
          } else if (targetStatus === 'glaze_fire' && !work.glaze_fire_date) {
            work.glaze_fire_date = todayStr
          }
        }
      })
      
      if (kiln.status === 'scheduled') {
        const totalWorks = mockData.works.filter(w => w.kiln_id === kilnId).length
        if (totalWorks >= kiln.capacity) {
          kiln.status = 'full'
          kiln.updated_at = now()
        }
      }
      
      return { success: true, message: `成功添加 ${workIds.length} 件作品到窑炉` }
    },
    
    async removeWork(kilnId, workId) {
      const work = mockData.works.find(w => w.id === workId)
      const kiln = mockData.kilns.find(k => k.id === kilnId)
      
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
      
      return { success: true, message: '作品已从窑炉中移除' }
    },
    
    async complete(kilnId) {
      const kiln = mockData.kilns.find(k => k.id === kilnId)
      if (!kiln) return { success: false, message: '窑炉不存在' }
      
      const works = mockData.works.filter(w => w.kiln_id === kilnId)
      const todayStr = today()
      
      works.forEach(work => {
        if (work.status === 'bisque') {
          work.status = 'glaze'
          work.bisque_date = work.bisque_date || todayStr
        } else if (work.status === 'glaze_fire') {
          work.status = 'ready'
          work.glaze_fire_date = work.glaze_fire_date || todayStr
          work.ready_date = todayStr
          
          const student = mockData.students.find(s => s.id === work.student_id)
          if (student) {
            const message = `【陶艺工作室】尊敬的${student.name}您好，您的作品「${work.name}」已烧制完成，可以来取件啦！`
            mockData.reminders.push({
              id: nextMockId.reminders++,
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
      
      return { success: true, message: `窑炉烧制完成，${works.length} 件作品已流转到下一状态` }
    },
    
    async cancel(kilnId) {
      const kiln = mockData.kilns.find(k => k.id === kilnId)
      if (!kiln) return { success: false, message: '窑炉不存在' }
      
      const works = mockData.works.filter(w => w.kiln_id === kilnId)
      
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
      
      return { success: true, message: `排期已取消，${works.length} 件作品已退回原状态` }
    }
  },
  
  work: {
    async getWithFees(workId) {
      const work = mockData.works.find(w => w.id === workId)
      if (!work) return null
      
      const fees = mockData.fees.filter(f => f.work_id === workId)
      const totalPaid = fees.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0)
      const totalUnpaid = fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0)
      
      return {
        ...work,
        fees,
        totalPaid,
        totalUnpaid,
        hasDebt: totalUnpaid > 0
      }
    }
  },
  
  fee: {
    async calculate(workId, feeType, temperature) {
      const work = mockData.works.find(w => w.id === workId)
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
    }
  },
  
  student: {
    async getStats(studentId) {
      const works = mockData.works.filter(w => w.student_id === studentId)
      const inProgress = works.filter(w => w.status !== 'picked').length
      const fees = mockData.fees.filter(f => f.student_id === studentId)
      const totalDebt = fees.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0)
      
      return {
        inProgress,
        totalWorks: works.length,
        totalDebt,
        hasDebt: totalDebt > 0
      }
    }
  },
  
  async selectImage() {
    alert('照片选择功能需要在 Electron 客户端中使用')
    return null
  }
}

const api = isElectron ? window.electronAPI : mockApi

export const db = {
  async getAll(table) {
    return await api.database.getAll(table)
  },
  
  async getById(table, id) {
    return await api.database.getById(table, id)
  },
  
  async create(table, data) {
    return await api.database.create(table, data)
  },
  
  async update(table, id, data) {
    return await api.database.update(table, id, data)
  },
  
  async remove(table, id) {
    return await api.database.delete(table, id)
  },
  
  async query(sql, params) {
    return await api.database.query(sql, params)
  }
}

export const kilnApi = {
  addWorks: (kilnId, workIds, targetStatus) => api.kiln.addWorks(kilnId, workIds, targetStatus),
  removeWork: (kilnId, workId) => api.kiln.removeWork(kilnId, workId),
  complete: (kilnId) => api.kiln.complete(kilnId),
  cancel: (kilnId) => api.kiln.cancel(kilnId)
}

export const workApi = {
  getWithFees: (workId) => api.work.getWithFees(workId)
}

export const feeApi = {
  calculate: (workId, feeType, temperature) => api.fee.calculate(workId, feeType, temperature)
}

export const studentApi = {
  getStats: (studentId) => api.student.getStats(studentId)
}

export const selectImage = () => api.selectImage()

export const isRunningInElectron = isElectron

export const WORK_STATUS = [
  { value: 'clay', label: '泥坯', color: '#1976d2' },
  { value: 'bisque', label: '素烧', color: '#f57c00' },
  { value: 'glaze', label: '上釉', color: '#7b1fa2' },
  { value: 'glaze_fire', label: '釉烧', color: '#c62828' },
  { value: 'ready', label: '待取件', color: '#2e7d32' },
  { value: 'picked', label: '已取件', color: '#546e7a' }
]

export const getStatusLabel = (status) => {
  const s = WORK_STATUS.find(s => s.value === status)
  return s ? s.label : status
}

export const getStatusColor = (status) => {
  const s = WORK_STATUS.find(s => s.value === status)
  return s ? s.color : '#999'
}

export const FEE_TYPES = [
  { value: 'material', label: '材料费' },
  { value: 'firing', label: '烧制费' },
  { value: 'makeup', label: '补课费' },
  { value: 'other', label: '其他费用' }
]

export const KILN_STATUS = [
  { value: 'scheduled', label: '已排期', type: 'info' },
  { value: 'full', label: '满窑', type: 'warning' },
  { value: 'firing', label: '烧制中', type: 'primary' },
  { value: 'completed', label: '已完成', type: 'success' },
  { value: 'cancelled', label: '已取消', type: 'danger' }
]
