<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <el-icon><Warning /></el-icon>
        取件提醒
      </div>
      <div style="display: flex; gap: 12px;">
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="handleGenerateReminders">
          生成待取件提醒
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-number glow-text">{{ stats.pending }}</div>
          <div class="stat-label">待联系</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-number glow-text">{{ stats.overdue }}</div>
          <div class="stat-label">逾期未取</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-number glow-text">{{ stats.contacted }}</div>
          <div class="stat-label">已联系</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple">
          <div class="stat-number glow-text">{{ stats.pickedUp }}</div>
          <div class="stat-label">已取件</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <div class="card">
          <h3 style="margin-bottom: 16px; color: #2c3e50;">📱 短信文案模板</h3>
          <el-radio-group v-model="selectedTemplate" style="margin-bottom: 16px;">
            <el-radio-button value="standard">标准模板</el-radio-button>
            <el-radio-button value="friendly">温馨模板</el-radio-button>
            <el-radio-button value="reminder">逾期提醒</el-radio-button>
          </el-radio-group>
          
          <div class="sms-preview">
            <div class="sms-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>短信预览</span>
            </div>
            <div class="sms-content">
              {{ currentSmsTemplate }}
            </div>
            <div style="text-align: right; margin-top: 8px;">
              <span style="color: #999; font-size: 12px;">
                {{ currentSmsTemplate.length }} 字
              </span>
            </div>
          </div>

          <el-divider />

          <div style="margin-bottom: 12px;">
            <span style="font-weight: 600;">💡 变量说明：</span>
          </div>
          <div style="font-size: 13px; color: #666; line-height: 2;">
            <div><code>{学员姓名}</code> - 自动替换为学员姓名</div>
            <div><code>{作品名称}</code> - 自动替换为作品名称</div>
            <div><code>{完成日期}</code> - 自动替换为完成日期</div>
            <div><code>{工作室名称}</code> - 工作室名称</div>
          </div>

          <el-divider />

          <el-form label-width="100px">
            <el-form-item label="工作室名">
              <el-input v-model="studioName" placeholder="陶艺工作室" />
            </el-form-item>
          </el-form>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 16px; color: #2c3e50;">⏰ 逾期提醒设置</h3>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span>作品完成后</span>
            <el-input-number v-model="overdueDays" :min="1" :max="30" />
            <span>天未取件视为逾期</span>
          </div>
          <el-alert 
            v-if="stats.overdue > 0"
            type="warning"
            :title="`有 ${stats.overdue} 件作品已逾期，请及时联系学员`"
            show-icon
            style="margin-top: 16px;"
          />
        </div>
      </el-col>

      <el-col :span="16">
        <div class="card">
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <el-radio-group v-model="filterStatus" size="default">
              <el-radio-button value="pending">待联系</el-radio-button>
              <el-radio-button value="overdue">逾期未取</el-radio-button>
              <el-radio-button value="contacted">已联系</el-radio-button>
              <el-radio-button value="all">全部</el-radio-button>
            </el-radio-group>
          </div>

          <el-table :data="filteredReminders" stripe style="width: 100%">
            <el-table-column label="学员" width="100">
              <template #default="{ row }">
                <div style="font-weight: 600;">{{ getStudentName(row.student_id) }}</div>
                <div style="font-size: 12px; color: #999;">{{ getStudentPhone(row.student_id) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="作品" width="140">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img v-if="getWorkPhoto(row.work_id)" :src="getWorkPhoto(row.work_id)" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" />
                  <div>
                    <div style="font-weight: 600;">{{ getWorkName(row.work_id) }}</div>
                    <div style="font-size: 12px; color: #999;">完成: {{ getWorkReadyDate(row.work_id) }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="短信内容" show-overflow-tooltip>
              <template #default="{ row }">
                <div style="font-size: 13px; color: #555;">{{ generateSms(row) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="isOverdue(row)" type="danger" size="small">
                  逾期{{ getOverdueDays(row) }}天
                </el-tag>
                <el-tag v-else-if="row.contacted" type="success" size="small">
                  已联系
                </el-tag>
                <el-tag v-else type="warning" size="small">
                  待联系
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="联系日期" width="120">
              <template #default="{ row }">
                {{ row.contact_date || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="handleCopySms(row)">
                  复制文案
                </el-button>
                <el-button v-if="!row.contacted" size="small" type="success" @click="handleMarkContacted(row)">
                  已联系
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Warning, Plus, Refresh, ChatDotRound } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { db } from '../utils/api'

const reminders = ref([])
const students = ref([])
const works = ref([])
const filterStatus = ref('pending')
const selectedTemplate = ref('standard')
const studioName = ref('陶艺工作室')
const overdueDays = ref(7)

const stats = ref({
  pending: 0,
  overdue: 0,
  contacted: 0,
  pickedUp: 0
})

const smsTemplates = {
  standard: '【{工作室名称}】尊敬的{学员姓名}您好，您的作品「{作品名称}」已于{完成日期}烧制完成，可以来取件啦！请您在方便的时候前来工作室领取，如有疑问请随时联系我们~',
  friendly: '【{工作室名称}】亲爱的{学员姓名}~ 您的作品「{作品名称}」已经烧制好啦🎉 作品于{完成日期}完成，正在工作室等您接它回家哦！期待您的光临~',
  reminder: '【{工作室名称}】温馨提醒：{学员姓名}您好，您的作品「{作品名称}」已于{完成日期}烧制完成，目前仍未取件。为避免作品长时间存放可能带来的损坏，请您尽快安排时间前来领取，感谢您的配合！'
}

const currentSmsTemplate = computed(() => smsTemplates[selectedTemplate.value])

const filteredReminders = computed(() => {
  let list = reminders.value
  
  if (filterStatus.value === 'pending') {
    list = list.filter(r => !r.contacted && !isOverdue(r))
  } else if (filterStatus.value === 'overdue') {
    list = list.filter(r => !r.contacted && isOverdue(r))
  } else if (filterStatus.value === 'contacted') {
    list = list.filter(r => r.contacted)
  }
  
  return list.sort((a, b) => {
    const dateA = getWorkReadyDate(a.work_id)
    const dateB = getWorkReadyDate(b.work_id)
    return new Date(dateA) - new Date(dateB)
  })
})

function getStudentName(id) {
  const s = students.value.find(s => s.id === id)
  return s ? s.name : '未知'
}

function getStudentPhone(id) {
  const s = students.value.find(s => s.id === id)
  return s ? (s.phone || s.wechat || '-') : '-'
}

function getWorkName(id) {
  const w = works.value.find(w => w.id === id)
  return w ? w.name : '未知'
}

function getWorkPhoto(id) {
  const w = works.value.find(w => w.id === id)
  return w ? w.photo : ''
}

function getWorkReadyDate(id) {
  const w = works.value.find(w => w.id === id)
  return w ? w.ready_date : '-'
}

function isOverdue(row) {
  const readyDate = getWorkReadyDate(row.work_id)
  if (!readyDate) return false
  const days = dayjs().diff(dayjs(readyDate), 'day')
  return days > overdueDays.value
}

function getOverdueDays(row) {
  const readyDate = getWorkReadyDate(row.work_id)
  if (!readyDate) return 0
  return dayjs().diff(dayjs(readyDate), 'day') - overdueDays.value
}

function generateSms(row) {
  let template = smsTemplates[selectedTemplate.value]
  template = template.replace('{工作室名称}', studioName.value)
  template = template.replace('{学员姓名}', getStudentName(row.student_id))
  template = template.replace('{作品名称}', getWorkName(row.work_id))
  template = template.replace('{完成日期}', getWorkReadyDate(row.work_id))
  return template
}

async function loadData() {
  reminders.value = await db.getAll('reminders')
  students.value = await db.getAll('students')
  works.value = await db.getAll('works')
  
  stats.value.pending = reminders.value.filter(r => !r.contacted && !isOverdue(r)).length
  stats.value.overdue = reminders.value.filter(r => !r.contacted && isOverdue(r)).length
  stats.value.contacted = reminders.value.filter(r => r.contacted).length
  
  const pickedWorks = works.value.filter(w => w.status === 'picked')
  stats.value.pickedUp = pickedWorks.length
}

async function handleGenerateReminders() {
  try {
    const allWorks = await db.getAll('works')
    const readyWorks = allWorks.filter(w => w.status === 'ready')
    
    const existingReminders = await db.getAll('reminders')
    const existingWorkIds = new Set(existingReminders.map(r => r.work_id))
    
    const newWorks = readyWorks.filter(w => !existingWorkIds.has(w.id))
    
    if (newWorks.length === 0) {
      ElMessage.info('没有新的待取件作品需要生成提醒')
      return
    }
    
    await ElMessageBox.confirm(`将为 ${newWorks.length} 件待取件作品生成提醒，是否继续？`, '生成提醒', {
      type: 'info'
    })
    
    for (const work of newWorks) {
      const message = generateSms({
        student_id: work.student_id,
        work_id: work.id
      })
      await db.create('reminders', {
        work_id: work.id,
        student_id: work.student_id,
        message,
        contacted: 0
      })
    }
    
    ElMessage.success(`成功生成 ${newWorks.length} 条取件提醒`)
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('生成失败')
      console.error(e)
    }
  }
}

async function handleCopySms(row) {
  const sms = generateSms(row)
  try {
    await navigator.clipboard.writeText(sms)
    ElMessage.success('短信文案已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败，请手动复制')
    console.error(e)
  }
}

async function handleMarkContacted(row) {
  try {
    await db.update('reminders', row.id, {
      contacted: 1,
      contact_date: dayjs().format('YYYY-MM-DD')
    })
    ElMessage.success('已标记为已联系')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
    console.error(e)
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除这条提醒吗？', '确认删除', {
      type: 'warning'
    })
    await db.remove('reminders', row.id)
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
.sms-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
}

.sms-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.9;
}

.sms-content {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  border-radius: 8px;
  line-height: 1.6;
  font-size: 13px;
  backdrop-filter: blur(10px);
}

code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
  color: #e74c3c;
}
</style>
