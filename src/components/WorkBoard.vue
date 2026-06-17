<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <el-icon><Picture /></el-icon>
        作品看板
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <el-select v-model="filterStudent" placeholder="按学员筛选" clearable style="width: 160px;">
          <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
        <el-button 
          v-if="batchMode" 
          type="success" 
          :disabled="selectedWorks.length === 0" 
          @click="showAddToKilnDialog"
        >
          加入窑炉 ({{ selectedWorks.length }})
        </el-button>
        <el-button v-if="batchMode" @click="exitBatchMode">退出批量</el-button>
        <el-button v-else type="warning" @click="enterBatchMode">批量选择</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增作品
        </el-button>
      </div>
    </div>

    <div class="kanban-board">
      <div 
        v-for="status in WORK_STATUS" 
        :key="status.value" 
        class="kanban-column"
      >
        <div class="kanban-column-header" :style="{ borderColor: status.color }">
          <span>{{ status.label }}</span>
          <el-tag size="small" type="info">
            {{ getWorksByStatus(status.value).length }}
          </el-tag>
        </div>
        
        <div
          v-for="work in getWorksByStatus(status.value)"
          :key="work.id"
          class="kanban-card"
          :class="{ 
            'card-selected': selectedWorks.includes(work.id),
            'card-in-kiln': work.kiln_id,
            'card-selectable': batchMode && canAddToKiln(work)
          }"
          @click="handleCardClick(work, $event)"
        >
          <div v-if="batchMode" class="card-checkbox" @click.stop>
            <el-checkbox 
              v-model="selectedWorks" 
              :value="work.id" 
              :disabled="!canAddToKiln(work)"
            />
          </div>
          <el-tag 
            v-if="work.kiln_id" 
            size="small" 
            type="warning" 
            class="kiln-badge"
          >
            🔥 {{ getKilnBatchNo(work.kiln_id) }}
          </el-tag>
          <img v-if="work.photo" :src="work.photo" class="kanban-card-photo" />
          <div v-else class="kanban-card-photo" style="display: flex; align-items: center; justify-content: center; color: #ccc;">
            <el-icon :size="32"><Picture /></el-icon>
          </div>
          <div class="kanban-card-title">{{ work.name }}</div>
          <div class="kanban-card-meta">
            👤 {{ getStudentName(work.student_id) }}
          </div>
          <div class="kanban-card-meta">
            📐 {{ work.size || '未设置' }}
            <span v-if="work.teacher" class="kanban-card-meta"> · 👨‍🏫 {{ work.teacher }}</span>
          </div>
          <div v-if="work.glaze_color" class="kanban-card-meta">
            🎨 
            <el-tag :color="work.glaze_color" effect="dark" style="color: #fff; padding: 0 8px; font-size: 11px;">
              {{ work.glaze_color }}
            </el-tag>
          </div>
          <span v-if="work.fragile" class="fragile-badge">
            ⚠️ 易碎
          </span>
          <div v-if="work.notes" class="kanban-card-meta" style="margin-top: 6px; font-size: 11px;">
            {{ work.notes }}
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑作品' : '新增作品'"
      width="700px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <div class="form-row">
          <el-form-item label="作品名称" required>
            <el-input v-model="form.name" placeholder="请输入作品名称" />
          </el-form-item>
          <el-form-item label="所属学员" required>
            <el-select v-model="form.student_id" placeholder="请选择学员" style="width: 100%;">
              <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="当前状态">
            <el-select v-model="form.status" style="width: 100%;">
              <el-option v-for="s in WORK_STATUS" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="责任老师">
            <el-input v-model="form.teacher" placeholder="请输入老师姓名" />
          </el-form-item>
          <el-form-item label="尺寸">
            <el-input v-model="form.size" placeholder="如：高15cm 宽10cm" />
          </el-form-item>
          <el-form-item label="釉色">
            <el-color-picker v-model="form.glaze_color" show-alpha />
          </el-form-item>
        </div>
        
        <el-form-item label="照片">
          <div style="display: flex; gap: 12px; align-items: center;">
            <div v-if="form.photo" style="position: relative;">
              <img :src="form.photo" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;" />
              <el-button 
                size="small" 
                type="danger" 
                circle 
                style="position: absolute; top: -8px; right: -8px;"
                @click="form.photo = ''"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-button :icon="Camera" @click="handleSelectPhoto">选择照片</el-button>
          </div>
        </el-form-item>

        <el-form-item label="易碎品">
          <el-switch v-model="form.fragile" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="特殊说明、注意事项等" />
        </el-form-item>

        <el-divider>状态时间线</el-divider>
        
        <div class="form-row">
          <el-form-item label="泥坯日期">
            <el-date-picker v-model="form.clay_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="素烧日期">
            <el-date-picker v-model="form.bisque_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="上釉日期">
            <el-date-picker v-model="form.glaze_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="釉烧日期">
            <el-date-picker v-model="form.glaze_fire_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="完成日期">
            <el-date-picker v-model="form.ready_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="取件日期">
            <el-date-picker v-model="form.picked_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
        </div>

        <el-divider v-if="isEdit">费用记录</el-divider>
        <div v-if="isEdit && workDetail" class="fee-section">
          <div class="fee-summary">
            <div class="fee-item">
              <span class="fee-label">已支付</span>
              <span class="fee-value paid">¥{{ workDetail.totalPaid || 0 }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">待支付</span>
              <span class="fee-value unpaid">¥{{ workDetail.totalUnpaid || 0 }}</span>
            </div>
            <el-tag v-if="workDetail.hasDebt" type="danger">有欠款</el-tag>
          </div>
          <div v-if="workDetail.fees && workDetail.fees.length > 0" class="fee-list">
            <div v-for="fee in workDetail.fees" :key="fee.id" class="fee-row">
              <span>{{ getFeeTypeLabel(fee.type) }}</span>
              <span>¥{{ fee.amount }}</span>
              <el-tag :type="fee.paid ? 'success' : 'danger'" size="small">
                {{ fee.paid ? '已付' : '未付' }}
              </el-tag>
              <span v-if="fee.payment_date">{{ fee.payment_date }}</span>
            </div>
          </div>
          <div v-else class="empty-fees">暂无关联费用</div>
        </div>
      </el-form>

      <template #footer>
        <div style="display: flex; gap: 8px;">
          <el-select v-if="isEdit && form.status !== 'picked'" v-model="nextStatus" placeholder="快速流转状态" style="width: 140px;">
            <el-option 
              v-for="s in getNextStatusOptions()" 
              :key="s.value" 
              :label="'→ ' + s.label" 
              :value="s.value" 
            />
          </el-select>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="addToKilnVisible"
      title="批量加入窑炉"
      width="500px"
    >
      <el-alert 
        type="info" 
        :title="`已选择 ${selectedWorks.length} 件作品`" 
        show-icon
        style="margin-bottom: 16px;"
      />
      <el-form label-width="100px">
        <el-form-item label="目标窑炉" required>
          <el-select v-model="selectedKilnId" placeholder="请选择窑炉批次" style="width: 100%;">
            <el-option 
              v-for="k in availableKilns" 
              :key="k.id" 
              :label="`${k.batch_no} - ${k.kiln_position}位 (${k.temperature}℃)`"
              :value="k.id"
            >
              <span>{{ k.batch_no }} - {{ k.kiln_position }}位 ({{ k.temperature }}℃)</span>
              <el-tag size="small" :type="getKilnStatusType(k.status)">
                {{ getKilnStatusLabel(k.status) }}
              </el-tag>
              <span style="margin-left: 8px; color: #999;">
                已装: {{ getKilnWorkCount(k.id) }}/{{ k.capacity }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="烧制类型" required>
          <el-radio-group v-model="targetFiringType">
            <el-radio value="bisque">素烧</el-radio>
            <el-radio value="glaze_fire">釉烧</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="selectedKilnId" label="窑炉信息">
          <div class="kiln-info">
            <div>📋 批次: {{ selectedKiln?.batch_no }}</div>
            <div>🌡️ 温度: {{ selectedKiln?.temperature }}℃</div>
            <div>📍 窑位: {{ selectedKiln?.kiln_position }}</div>
            <div>⏱️ 时长: {{ selectedKiln?.duration_hours }}小时</div>
            <div>📦 已装: {{ getKilnWorkCount(selectedKilnId) }}/{{ selectedKiln?.capacity }}</div>
            <div>✅ 可装: {{ (selectedKiln?.capacity || 0) - getKilnWorkCount(selectedKilnId) }}</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addToKilnVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :disabled="!selectedKilnId || !targetFiringType"
          @click="handleAddToKiln"
        >
          确认加入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture, Camera, Close } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { db, selectImage, WORK_STATUS, getStatusLabel, kilnApi, workApi, FEE_TYPES, KILN_STATUS } from '../utils/api'

const works = ref([])
const students = ref([])
const kilns = ref([])
const filterStudent = ref(null)
const dialogVisible = ref(false)
const addToKilnVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const nextStatus = ref('')
const batchMode = ref(false)
const selectedWorks = ref([])
const selectedKilnId = ref(null)
const targetFiringType = ref('')
const workDetail = ref(null)

const form = ref({
  student_id: null,
  name: '',
  status: 'clay',
  photo: '',
  size: '',
  fragile: 0,
  teacher: '',
  glaze_color: '',
  notes: '',
  clay_date: '',
  bisque_date: '',
  glaze_date: '',
  glaze_fire_date: '',
  ready_date: '',
  picked_date: ''
})

const filteredWorks = computed(() => {
  if (!filterStudent.value) return works.value
  return works.value.filter(w => w.student_id === filterStudent.value)
})

const availableKilns = computed(() => {
  return kilns.value.filter(k => k.status === 'scheduled' || k.status === 'full')
})

const selectedKiln = computed(() => {
  return kilns.value.find(k => k.id === selectedKilnId.value)
})

function getWorksByStatus(status) {
  return filteredWorks.value.filter(w => w.status === status)
}

function getStudentName(studentId) {
  const s = students.value.find(s => s.id === studentId)
  return s ? s.name : '未知'
}

function getKilnBatchNo(kilnId) {
  const k = kilns.value.find(k => k.id === kilnId)
  return k ? k.batch_no : '未知窑炉'
}

function getKilnWorkCount(kilnId) {
  return works.value.filter(w => w.kiln_id === kilnId).length
}

function getKilnStatusLabel(status) {
  const s = KILN_STATUS.find(s => s.value === status)
  return s ? s.label : status
}

function getKilnStatusType(status) {
  const s = KILN_STATUS.find(s => s.value === status)
  return s ? s.type : 'info'
}

function getFeeTypeLabel(type) {
  const t = FEE_TYPES.find(t => t.value === type)
  return t ? t.label : type
}

function canAddToKiln(work) {
  if (work.kiln_id) return false
  return work.status === 'clay' || work.status === 'glaze'
}

function getNextStatusOptions() {
  const currentIdx = WORK_STATUS.findIndex(s => s.value === form.value.status)
  return WORK_STATUS.slice(currentIdx + 1, currentIdx + 2)
}

async function loadData() {
  works.value = await db.getAll('works')
  students.value = await db.getAll('students')
  kilns.value = await db.getAll('kilns')
}

function enterBatchMode() {
  batchMode.value = true
  selectedWorks.value = []
}

function exitBatchMode() {
  batchMode.value = false
  selectedWorks.value = []
}

function handleCardClick(work, event) {
  if (batchMode.value && canAddToKiln(work)) {
    const idx = selectedWorks.value.indexOf(work.id)
    if (idx >= 0) {
      selectedWorks.value.splice(idx, 1)
    } else {
      selectedWorks.value.push(work.id)
    }
  } else if (!batchMode.value) {
    handleEdit(work)
  }
}

function showAddToKilnDialog() {
  selectedKilnId.value = null
  targetFiringType.value = ''
  
  const hasClay = selectedWorks.value.some(id => {
    const w = works.value.find(w => w.id === id)
    return w && w.status === 'clay'
  })
  const hasGlaze = selectedWorks.value.some(id => {
    const w = works.value.find(w => w.id === id)
    return w && w.status === 'glaze'
  })
  
  if (hasClay && !hasGlaze) {
    targetFiringType.value = 'bisque'
  } else if (hasGlaze && !hasClay) {
    targetFiringType.value = 'glaze_fire'
  }
  
  addToKilnVisible.value = true
}

async function handleAddToKiln() {
  if (!selectedKilnId.value) {
    ElMessage.warning('请选择窑炉')
    return
  }
  if (!targetFiringType.value) {
    ElMessage.warning('请选择烧制类型')
    return
  }
  
  try {
    const result = await kilnApi.addWorks(selectedKilnId.value, selectedWorks.value, targetFiringType.value)
    if (result.success) {
      ElMessage.success(result.message)
      addToKilnVisible.value = false
      exitBatchMode()
      await loadData()
    } else {
      ElMessage.error(result.message)
    }
  } catch (e) {
    ElMessage.error('操作失败')
    console.error(e)
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = null
  nextStatus.value = ''
  workDetail.value = null
  form.value = {
    student_id: null,
    name: '',
    status: 'clay',
    photo: '',
    size: '',
    fragile: 0,
    teacher: '',
    glaze_color: '',
    notes: '',
    clay_date: dayjs().format('YYYY-MM-DD'),
    bisque_date: '',
    glaze_date: '',
    glaze_fire_date: '',
    ready_date: '',
    picked_date: ''
  }
  dialogVisible.value = true
}

async function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  nextStatus.value = ''
  form.value = { ...row }
  
  try {
    workDetail.value = await workApi.getWithFees(row.id)
  } catch (e) {
    workDetail.value = { ...row, fees: [], totalPaid: 0, totalUnpaid: 0, hasDebt: false }
  }
  
  dialogVisible.value = true
}

async function handleSelectPhoto() {
  const photo = await selectImage()
  if (photo) {
    form.value.photo = photo
  }
}

async function handleSave() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入作品名称')
    return
  }
  if (!form.value.student_id) {
    ElMessage.warning('请选择所属学员')
    return
  }

  const needCreateReminder = nextStatus.value === 'ready'
  
  if (nextStatus.value) {
    form.value.status = nextStatus.value
    const today = dayjs().format('YYYY-MM-DD')
    if (nextStatus.value === 'bisque') form.value.bisque_date = today
    if (nextStatus.value === 'glaze') form.value.glaze_date = today
    if (nextStatus.value === 'glaze_fire') form.value.glaze_fire_date = today
    if (nextStatus.value === 'ready') form.value.ready_date = today
    if (nextStatus.value === 'picked') form.value.picked_date = today
  }

  try {
    const data = { ...form.value, fragile: form.value.fragile ? 1 : 0 }
    let workId = editId.value
    
    if (isEdit.value) {
      await db.update('works', editId.value, data)
      ElMessage.success(`作品已更新为「${getStatusLabel(form.value.status)}」`)
    } else {
      const result = await db.create('works', data)
      workId = result.id
      ElMessage.success('作品添加成功')
    }
    
    if (needCreateReminder && workId) {
      await createReminder({ ...form.value, id: workId })
    }
    
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('保存失败')
    console.error(e)
  }
}

async function createReminder(work) {
  const student = students.value.find(s => s.id === work.student_id)
  if (!student) return
  
  const message = `【陶艺工作室】尊敬的${student.name}您好，您的作品「${work.name}」已烧制完成，可以来取件啦！`
  
  await db.create('reminders', {
    work_id: work.id,
    student_id: work.student_id,
    message,
    contacted: 0
  })
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除作品"${row.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    await db.remove('works', row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(e)
    }
  }
}

watch(dialogVisible, (val) => {
  if (!val) {
    workDetail.value = null
  }
})

onMounted(loadData)
</script>

<style scoped>
.card-selectable {
  cursor: pointer;
}

.card-selected {
  border-color: #67c23a !important;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.3);
}

.card-in-kiln {
  opacity: 0.85;
}

.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 4px;
}

.kiln-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.fee-section {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.fee-summary {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 16px;
}

.fee-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fee-label {
  color: #909399;
  font-size: 12px;
}

.fee-value {
  font-size: 18px;
  font-weight: bold;
}

.fee-value.paid {
  color: #67c23a;
}

.fee-value.unpaid {
  color: #f56c6c;
}

.fee-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fee-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
}

.empty-fees {
  color: #909399;
  text-align: center;
  padding: 20px;
}

.kiln-info {
  background: #ecf5ff;
  padding: 12px;
  border-radius: 6px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
