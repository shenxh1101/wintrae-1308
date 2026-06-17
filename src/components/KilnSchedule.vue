<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <el-icon><TrendCharts /></el-icon>
        窑炉排期
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增排期
      </el-button>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-number glow-text">{{ stats.scheduled }}</div>
          <div class="stat-label">已排期</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-number glow-text">{{ stats.firing }}</div>
          <div class="stat-label">烧制中</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-number glow-text">{{ stats.completed }}</div>
          <div class="stat-label">本月完成</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple">
          <div class="stat-number glow-text">{{ stats.totalHours.toFixed(1) }}h</div>
          <div class="stat-label">累计工时</div>
        </div>
      </el-col>
    </el-row>

    <div class="card">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="日历视图" name="calendar">
          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
            <el-button :icon="ArrowLeft" circle @click="prevMonth" />
            <span style="font-size: 18px; font-weight: 600;">{{ currentMonthLabel }}</span>
            <el-button :icon="ArrowRight" circle @click="nextMonth" />
            <el-button @click="goToday" style="margin-left: 20px;">今天</el-button>
          </div>
          
          <div class="calendar-grid">
            <div v-for="day in weekDays" :key="day" class="calendar-header">
              {{ day }}
            </div>
            <div 
              v-for="(day, idx) in calendarDays" 
              :key="idx"
              class="calendar-day"
              :class="{ 
                'other-month': !day.currentMonth,
                'today': day.isToday,
                'has-kiln': day.kilns.length > 0
              }"
            >
              <div class="day-number">{{ day.date }}</div>
              <div 
                v-for="kiln in day.kilns" 
                :key="kiln.id"
                class="kiln-mini-card"
                :class="`status-${kiln.status}`"
                @click="handleEdit(kiln)"
              >
                <div class="kiln-mini-title">{{ kiln.batch_no }}</div>
                <div class="kiln-mini-info">{{ kiln.temperature }}°C · {{ kiln.duration_hours }}h</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="列表视图" name="list">
          <div style="margin-bottom: 20px;">
            <el-select v-model="filterStatus" placeholder="按状态筛选" clearable style="width: 160px; margin-right: 12px;">
              <el-option v-for="s in KILN_STATUS" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </div>

          <el-table :data="filteredKilns" stripe style="width: 100%">
            <el-table-column prop="batch_no" label="批次号" width="120" />
            <el-table-column prop="scheduled_date" label="烧制日期" width="120" />
            <el-table-column prop="temperature" label="温度(°C)" width="100">
              <template #default="{ row }">
                <el-tag :type="getTempType(row.temperature)" effect="dark">
                  {{ row.temperature }}°C
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="kiln_position" label="窑位" width="100" />
            <el-table-column prop="duration_hours" label="时长(h)" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" show-overflow-tooltip />
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click" @command="(cmd) => handleStatusChange(row, cmd)">
                  <el-button size="small" type="primary">
                    状态变更 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="full" :disabled="row.status === 'full'">标记满窑</el-dropdown-item>
                      <el-dropdown-item command="firing" :disabled="row.status === 'firing'">开始烧制</el-dropdown-item>
                      <el-dropdown-item command="completed" :disabled="row.status === 'completed'">烧制完成</el-dropdown-item>
                      <el-dropdown-item command="cancelled" :disabled="row.status === 'cancelled'">取消排期</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑排期' : '新增排期'"
      width="550px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <div class="form-row">
          <el-form-item label="批次号" required>
            <el-input v-model="form.batch_no" placeholder="如：2024-01-01-A" />
          </el-form-item>
          <el-form-item label="烧制日期" required>
            <el-date-picker v-model="form.scheduled_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="烧制温度" required>
            <el-select v-model="form.temperature" style="width: 100%;">
              <el-option label="低温 (700-900°C)" :value="800" />
              <el-option label="中温 (1100-1200°C)" :value="1180" />
              <el-option label="高温 (1200-1300°C)" :value="1240" />
              <el-option label="自定义" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.temperature === 0" label="自定义温度">
            <el-input-number v-model="form.temperature" :min="500" :max="1400" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="窑位">
            <el-select v-model="form.kiln_position" style="width: 100%;">
              <el-option label="窑位A" value="A" />
              <el-option label="窑位B" value="B" />
              <el-option label="窑位C" value="C" />
              <el-option label="满窑" value="FULL" />
            </el-select>
          </el-form-item>
          <el-form-item label="预计时长(h)">
            <el-input-number v-model="form.duration_hours" :min="0.5" :step="0.5" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%;">
              <el-option v-for="s in KILN_STATUS" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="作品清单、注意事项等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, ArrowLeft, ArrowRight, ArrowDown, TrendCharts } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { db, KILN_STATUS } from '../utils/api'

const kilns = ref([])
const activeTab = ref('calendar')
const filterStatus = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const currentMonth = ref(dayjs())

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const stats = ref({
  scheduled: 0,
  firing: 0,
  completed: 0,
  totalHours: 0
})

const form = ref({
  batch_no: '',
  temperature: 1180,
  kiln_position: '',
  duration_hours: 8,
  scheduled_date: '',
  status: 'scheduled',
  notes: ''
})

const currentMonthLabel = computed(() => {
  return currentMonth.value.format('YYYY年MM月')
})

const filteredKilns = computed(() => {
  let list = kilns.value
  if (filterStatus.value) {
    list = list.filter(k => k.status === filterStatus.value)
  }
  return list.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
})

const calendarDays = computed(() => {
  const year = currentMonth.value.year()
  const month = currentMonth.value.month()
  const firstDay = dayjs(`${year}-${month + 1}-01`)
  const startDay = firstDay.subtract(firstDay.day(), 'day')
  const today = dayjs()
  
  const days = []
  for (let i = 0; i < 42; i++) {
    const date = startDay.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')
    days.push({
      date: date.date(),
      dateStr,
      currentMonth: date.month() === month,
      isToday: date.isSame(today, 'day'),
      kilns: kilns.value.filter(k => k.scheduled_date === dateStr)
    })
  }
  return days
})

function getStatusType(status) {
  const s = KILN_STATUS.find(s => s.value === status)
  return s ? s.type : 'info'
}

function getStatusLabel(status) {
  const s = KILN_STATUS.find(s => s.value === status)
  return s ? s.label : status
}

function getTempType(temp) {
  if (temp < 1000) return 'success'
  if (temp < 1200) return 'warning'
  return 'danger'
}

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
}

function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, 'month')
}

function goToday() {
  currentMonth.value = dayjs()
}

async function loadData() {
  kilns.value = await db.getAll('kilns')
  
  stats.value.scheduled = kilns.value.filter(k => k.status === 'scheduled').length
  stats.value.firing = kilns.value.filter(k => k.status === 'firing').length
  
  const thisMonth = dayjs().format('YYYY-MM')
  stats.value.completed = kilns.value.filter(k => 
    k.status === 'completed' && k.scheduled_date.startsWith(thisMonth)
  ).length
  
  stats.value.totalHours = kilns.value.reduce((sum, k) => sum + (k.duration_hours || 0), 0)
}

function handleAdd() {
  isEdit.value = false
  editId.value = null
  form.value = {
    batch_no: dayjs().format('YYYYMMDD') + '-A',
    temperature: 1180,
    kiln_position: '',
    duration_hours: 8,
    scheduled_date: dayjs().format('YYYY-MM-DD'),
    status: 'scheduled',
    notes: ''
  }
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleStatusChange(row, newStatus) {
  try {
    await db.update('kilns', row.id, { status: newStatus })
    ElMessage.success(`状态已更新为「${getStatusLabel(newStatus)}」`)
    loadData()
  } catch (e) {
    ElMessage.error('更新失败')
    console.error(e)
  }
}

async function handleSave() {
  if (!form.value.batch_no.trim()) {
    ElMessage.warning('请输入批次号')
    return
  }
  if (!form.value.scheduled_date) {
    ElMessage.warning('请选择烧制日期')
    return
  }
  if (!form.value.temperature || form.value.temperature <= 0) {
    ElMessage.warning('请设置烧制温度')
    return
  }

  try {
    if (isEdit.value) {
      await db.update('kilns', editId.value, form.value)
      ElMessage.success('修改成功')
    } else {
      await db.create('kilns', form.value)
      ElMessage.success('排期添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('保存失败')
    console.error(e)
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除排期"${row.batch_no}"吗？`, '确认删除', {
      type: 'warning'
    })
    await db.remove('kilns', row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(e)
    }
  }
}

onMounted(loadData)
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-header {
  text-align: center;
  font-weight: 600;
  padding: 12px;
  background: #f0f4f8;
  border-radius: 8px;
  color: #2c3e50;
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.calendar-day.other-month {
  background: #fafafa;
  opacity: 0.5;
}

.calendar-day.today {
  border: 2px solid #667eea;
  background: linear-gradient(135deg, #e8f0fe 0%, #f0e8fe 100%);
}

.day-number {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

.calendar-day.today .day-number {
  color: #667eea;
}

.kiln-mini-card {
  background: #e3f2fd;
  border-radius: 4px;
  padding: 4px 6px;
  margin-bottom: 4px;
  font-size: 11px;
  border-left: 3px solid #1976d2;
}

.kiln-mini-card.status-full {
  background: #fff3e0;
  border-left-color: #f57c00;
}

.kiln-mini-card.status-firing {
  background: #ffebee;
  border-left-color: #c62828;
}

.kiln-mini-card.status-completed {
  background: #e8f5e9;
  border-left-color: #2e7d32;
}

.kiln-mini-card.status-cancelled {
  background: #eceff1;
  border-left-color: #546e7a;
}

.kiln-mini-title {
  font-weight: 600;
  color: #2c3e50;
}

.kiln-mini-info {
  color: #7f8c8d;
  font-size: 10px;
}
</style>
