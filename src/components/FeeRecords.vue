<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <el-icon><Goods /></el-icon>
        费用记录
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        登记费用
      </el-button>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-number glow-text">¥{{ stats.totalIncome.toFixed(2) }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-number glow-text">¥{{ stats.totalDebt.toFixed(2) }}</div>
          <div class="stat-label">待收欠款</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-number glow-text">{{ stats.materialCount }}</div>
          <div class="stat-label">材料费笔数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple">
          <div class="stat-number glow-text">{{ stats.firingCount }}</div>
          <div class="stat-label">烧制费笔数</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <div class="card">
          <h3 style="margin-bottom: 16px; color: #2c3e50;">费用分类统计</h3>
          <div v-for="item in typeStats" :key="item.type" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>{{ item.label }}</span>
              <span style="font-weight: 600;">¥{{ item.amount.toFixed(2) }}</span>
            </div>
            <el-progress 
              :percentage="Math.round((item.amount / (stats.totalIncome + stats.totalDebt)) * 100)" 
              :color="item.color"
            />
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 16px; color: #2c3e50;">欠款学员 TOP 5</h3>
          <el-table :data="debtorList" size="small" style="width: 100%;">
            <el-table-column prop="name" label="学员" />
            <el-table-column prop="debt" label="欠款金额" width="100">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: 600;">¥{{ row.debt.toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="debtorList.length === 0" description="暂无欠款" :image-size="80" />
        </div>
      </el-col>

      <el-col :span="16">
        <div class="card">
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <el-select v-model="filterType" placeholder="按类型筛选" clearable style="width: 140px;">
              <el-option v-for="t in FEE_TYPES" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
            <el-select v-model="filterStudent" placeholder="按学员筛选" clearable style="width: 140px;">
              <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
            <el-select v-model="filterPaid" placeholder="按状态筛选" clearable style="width: 140px;">
              <el-option label="已结清" :value="1" />
              <el-option label="未结清" :value="0" />
            </el-select>
          </div>

          <el-table :data="filteredFees" stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="70" />
            <el-table-column label="学员" width="100">
              <template #default="{ row }">
                {{ getStudentName(row.student_id) }}
              </template>
            </el-table-column>
            <el-table-column label="关联作品" width="120">
              <template #default="{ row }">
                {{ getWorkName(row.work_id) }}
              </template>
            </el-table-column>
            <el-table-column label="费用类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)">
                  {{ getTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="100">
              <template #default="{ row }">
                <span style="font-weight: 600; color: #67c23a;">¥{{ row.amount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.paid ? 'success' : 'danger'" size="small">
                  {{ row.paid ? '已付' : '未付' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="payment_date" label="付款日期" width="120" />
            <el-table-column prop="notes" label="备注" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button v-if="!row.paid" size="small" type="success" @click="handleMarkPaid(row)">
                  标记已付
                </el-button>
                <el-button size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑费用' : '登记费用'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <div class="form-row">
          <el-form-item label="学员" required>
            <el-select v-model="form.student_id" placeholder="请选择学员" style="width: 100%;" @change="onStudentChange">
              <el-option v-for="s in students" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联作品">
            <el-select v-model="form.work_id" placeholder="选择作品（可选）" style="width: 100%;" clearable @change="onWorkChange">
              <el-option v-for="w in studentWorks" :key="w.id" :label="w.name" :value="w.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="费用类型" required>
            <el-select v-model="form.type" style="width: 100%;" @change="onTypeChange">
              <el-option v-for="t in FEE_TYPES" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </el-form-item>
        </div>

        <div v-if="canAutoCalculate" class="auto-calc-section">
          <el-alert 
            type="info" 
            :closable="false" 
            title="智能计算费用"
            style="margin-bottom: 16px;"
          >
            <template #default>
              <div style="margin-top: 8px;">
                <div v-if="selectedWork">
                  <div>📦 作品尺寸: {{ selectedWork.size || '未设置' }}</div>
                  <div>🌡️ 烧制温度: {{ calcTemperature }}℃</div>
                  <div v-if="calcSizeFactor">📐 尺寸系数: ×{{ calcSizeFactor }}</div>
                  <div v-if="calcTempFactor">🔥 温度系数: ×{{ calcTempFactor }}</div>
                  <div style="margin-top: 8px; font-weight: 600;">
                    建议金额: ¥{{ suggestedAmount.toFixed(2) }}
                  </div>
                </div>
                <el-button 
                  type="primary" 
                  size="small" 
                  :icon="Refresh"
                  style="margin-top: 8px;"
                  @click="calculateFee"
                >
                  应用建议金额
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>

        <div class="form-row">
          <el-form-item label="金额(¥)" required>
            <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="付款状态">
            <el-switch v-model="form.paid" active-text="已付" inactive-text="未付" />
          </el-form-item>
          <el-form-item label="付款日期" v-if="form.paid">
            <el-date-picker v-model="form.payment_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="费用说明" />
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
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Goods, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { db, FEE_TYPES, feeApi } from '../utils/api'

const fees = ref([])
const students = ref([])
const works = ref([])
const filterType = ref('')
const filterStudent = ref(null)
const filterPaid = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const suggestedAmount = ref(0)
const calcSizeFactor = ref(1)
const calcTempFactor = ref(1)
const calcTemperature = ref(1180)

const stats = ref({
  totalIncome: 0,
  totalDebt: 0,
  materialCount: 0,
  firingCount: 0
})

const form = ref({
  student_id: null,
  work_id: null,
  type: 'material',
  amount: 0,
  paid: 0,
  payment_date: '',
  notes: ''
})

const canAutoCalculate = computed(() => {
  if (isEdit.value) return false
  if (!form.value.work_id) return false
  return form.value.type === 'material' || form.value.type === 'firing'
})

const selectedWork = computed(() => {
  if (!form.value.work_id) return null
  return works.value.find(w => w.id === form.value.work_id)
})

const studentWorks = computed(() => {
  if (!form.value.student_id) return []
  return works.value.filter(w => w.student_id === form.value.student_id)
})

const filteredFees = computed(() => {
  let list = fees.value
  if (filterType.value) list = list.filter(f => f.type === filterType.value)
  if (filterStudent.value) list = list.filter(f => f.student_id === filterStudent.value)
  if (filterPaid.value !== '') list = list.filter(f => f.paid === filterPaid.value)
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const typeStats = computed(() => {
  const result = FEE_TYPES.map(t => ({
    type: t.value,
    label: t.label,
    amount: 0,
    color: getTypeColor(t.value)
  }))
  
  fees.value.forEach(f => {
    const item = result.find(r => r.type === f.type)
    if (item) item.amount += f.amount
  })
  
  return result
})

const debtorList = computed(() => {
  const debtorMap = {}
  fees.value.filter(f => !f.paid).forEach(f => {
    if (!debtorMap[f.student_id]) {
      debtorMap[f.student_id] = {
        id: f.student_id,
        name: getStudentName(f.student_id),
        debt: 0
      }
    }
    debtorMap[f.student_id].debt += f.amount
  })
  
  return Object.values(debtorMap)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 5)
})

function getStudentName(id) {
  const s = students.value.find(s => s.id === id)
  return s ? s.name : '未知'
}

function getWorkName(id) {
  if (!id) return '-'
  const w = works.value.find(w => w.id === id)
  return w ? w.name : '-'
}

function getTypeLabel(type) {
  const t = FEE_TYPES.find(t => t.value === type)
  return t ? t.label : type
}

function getTypeTagType(type) {
  const map = {
    material: '',
    firing: 'warning',
    makeup: 'primary',
    other: 'info'
  }
  return map[type] || ''
}

function getTypeColor(type) {
  const map = {
    material: '#67c23a',
    firing: '#e6a23c',
    makeup: '#409eff',
    other: '#909399'
  }
  return map[type] || '#909399'
}

function onStudentChange() {
  form.value.work_id = null
}

function onWorkChange() {
  if (canAutoCalculate.value) {
    calculateFee()
  }
}

function onTypeChange() {
  if (canAutoCalculate.value) {
    calculateFee()
  }
}

async function calculateFee() {
  if (!form.value.work_id) return
  if (!form.value.type) return
  
  let temperature = 1180
  if (form.value.type === 'firing') {
    temperature = calcTemperature.value
  }
  
  try {
    const result = await feeApi.calculate(form.value.work_id, form.value.type, temperature)
    if (result.success) {
      suggestedAmount.value = result.amount
      
      if (selectedWork.value && selectedWork.value.size) {
        const sizeMatch = selectedWork.value.size.match(/(\d+(?:\.\d+)?)\s*cm/i)
        if (sizeMatch) {
          const maxDim = parseFloat(sizeMatch[1])
          if (maxDim > 30) calcSizeFactor.value = 2.5
          else if (maxDim > 20) calcSizeFactor.value = 1.8
          else if (maxDim > 10) calcSizeFactor.value = 1.3
          else calcSizeFactor.value = 1
        }
      }
      
      if (form.value.type === 'firing') {
        if (temperature >= 1240) calcTempFactor.value = 1.5
        else if (temperature >= 1180) calcTempFactor.value = 1.2
        else calcTempFactor.value = 1
      }
    }
  } catch (e) {
    console.error('计算费用失败', e)
  }
}

async function loadData() {
  fees.value = await db.getAll('fees')
  students.value = await db.getAll('students')
  works.value = await db.getAll('works')
  
  stats.value.totalIncome = fees.value.filter(f => f.paid).reduce((sum, f) => sum + f.amount, 0)
  stats.value.totalDebt = fees.value.filter(f => !f.paid).reduce((sum, f) => sum + f.amount, 0)
  stats.value.materialCount = fees.value.filter(f => f.type === 'material').length
  stats.value.firingCount = fees.value.filter(f => f.type === 'firing').length
}

function handleAdd() {
  isEdit.value = false
  editId.value = null
  suggestedAmount.value = 0
  form.value = {
    student_id: null,
    work_id: null,
    type: 'material',
    amount: 0,
    paid: 0,
    payment_date: dayjs().format('YYYY-MM-DD'),
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

async function handleMarkPaid(row) {
  try {
    await ElMessageBox.confirm(`确认该笔 ¥${row.amount.toFixed(2)} 费用已结清？`, '确认收款', {
      type: 'success'
    })
    await db.update('fees', row.id, { 
      paid: 1, 
      payment_date: dayjs().format('YYYY-MM-DD') 
    })
    ElMessage.success('已标记为已付款')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

async function handleSave() {
  if (!form.value.student_id) {
    ElMessage.warning('请选择学员')
    return
  }
  if (!form.value.amount || form.value.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }

  try {
    const data = { ...form.value, paid: form.value.paid ? 1 : 0 }
    
    if (isEdit.value) {
      await db.update('fees', editId.value, data)
      ElMessage.success('修改成功')
    } else {
      await db.create('fees', data)
      ElMessage.success('费用登记成功')
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
    await ElMessageBox.confirm(`确定要删除该笔 ¥${row.amount.toFixed(2)} 的费用记录吗？`, '确认删除', {
      type: 'warning'
    })
    await db.remove('fees', row.id)
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
    suggestedAmount.value = 0
  }
})

onMounted(loadData)
</script>

<style scoped>
.auto-calc-section {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>
