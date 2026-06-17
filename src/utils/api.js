let mockData = {
  students: [
    { id: 1, name: '张三', phone: '13800138001', wechat: 'zhangsan_wx', course_count: 10, used_count: 3, preferred_glaze: '#409eff', notes: '喜欢蓝色系', created_at: '2024-01-15 10:30:00' },
    { id: 2, name: '李四', phone: '13800138002', wechat: 'lisi_wx', course_count: 5, used_count: 5, preferred_glaze: '#67c23a', notes: '已用完课时', created_at: '2024-01-20 14:20:00' },
    { id: 3, name: '王五', phone: '13800138003', wechat: 'wangwu_wx', course_count: 20, used_count: 8, preferred_glaze: '#e6a23c', notes: '', created_at: '2024-02-01 09:15:00' }
  ],
  works: [
    { id: 1, student_id: 1, name: '青花茶杯', status: 'clay', photo: '', size: '高8cm 直径6cm', fragile: 1, teacher: '李老师', glaze_color: '#409eff', notes: '薄胎，注意轻拿轻放', clay_date: '2024-06-15', bisque_date: '', glaze_date: '', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-15 10:00:00' },
    { id: 2, student_id: 1, name: '手拉坯花瓶', status: 'bisque', photo: '', size: '高20cm 直径10cm', fragile: 0, teacher: '李老师', glaze_color: '', notes: '', clay_date: '2024-06-10', bisque_date: '2024-06-12', glaze_date: '', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-10 11:00:00' },
    { id: 3, student_id: 3, name: '陶瓷盘子', status: 'glaze', photo: '', size: '直径25cm', fragile: 0, teacher: '王老师', glaze_color: '#e6a23c', notes: '釉下彩', clay_date: '2024-06-05', bisque_date: '2024-06-07', glaze_date: '2024-06-14', glaze_fire_date: '', ready_date: '', picked_date: '', created_at: '2024-06-05 14:00:00' },
    { id: 4, student_id: 2, name: '小茶盏', status: 'ready', photo: '', size: '高4cm 直径6cm', fragile: 1, teacher: '李老师', glaze_color: '#67c23a', notes: '木叶天目', clay_date: '2024-06-01', bisque_date: '2024-06-03', glaze_date: '2024-06-05', glaze_fire_date: '2024-06-08', ready_date: '2024-06-10', picked_date: '', created_at: '2024-06-01 10:00:00' },
    { id: 5, student_id: 3, name: '茶叶罐', status: 'glaze_fire', photo: '', size: '高12cm 直径8cm', fragile: 0, teacher: '王老师', glaze_color: '#909399', notes: '', clay_date: '2024-06-08', bisque_date: '2024-06-10', glaze_date: '2024-06-12', glaze_fire_date: '2024-06-15', ready_date: '', picked_date: '', created_at: '2024-06-08 15:00:00' }
  ],
  kilns: [
    { id: 1, batch_no: '20240618-A', temperature: 1240, kiln_position: 'A', duration_hours: 10, scheduled_date: '2024-06-18', status: 'scheduled', notes: '高温釉烧，含20件作品' },
    { id: 2, batch_no: '20240615-B', temperature: 1180, kiln_position: 'B', duration_hours: 8, scheduled_date: '2024-06-15', status: 'completed', notes: '中温素烧' },
    { id: 3, batch_no: '20240620-A', temperature: 1240, kiln_position: 'FULL', duration_hours: 12, scheduled_date: '2024-06-20', status: 'full', notes: '满窑，30件作品' }
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
  works: 6,
  kilns: 4,
  fees: 4,
  reminders: 2
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
            const inMatch = where.match(/not in\s*\(\s*select\s+(\w+)\s+from\s+(\w+)/i)
            if (inMatch) {
              const subField = inMatch[1]
              const subTable = inMatch[2]
              const subIds = (mockData[subTable] || []).map(item => item[subField])
              rows = rows.filter(r => !subIds.includes(r[subField]))
            }
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
