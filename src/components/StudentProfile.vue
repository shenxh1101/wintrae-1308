<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <el-icon><User /></el-icon>
        学员档案
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增学员
      </el-button>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-number glow-text">{{ stats.total }}</div>
          <div class="stat-label">学员总数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-number glow-text">{{ stats.active }}</div>
          <div class="stat-label">活跃学员</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-number glow-text">{{ stats.totalCourses }}</div>
          <div class="stat-label">剩余课程</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple">
          <div class="stat-number glow-text">{{ stats.worksCount }}</div>
          <div class="stat-label">在制作品</div>
        </div>
      </el-col>
    </el-row>

    <div class="card">
      <div style="display: flex; gap: 16px; margin-bottom: 20px;">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学员姓名、电话..."
          :prefix-icon="Search"
          clearable
          style="max-width: 300px;"
        />
      </div>

      <el-table :data="filteredStudents" stripe style="width: 100%">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="wechat" label="微信号" width="140" />
        <el-table-column label="课程情况" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="row.course_count > 0 ? Math.round((row.used_count / row.course_count) * 100) : 0"
              :format="() => `${row.used_count}/${row.course_count}次`"
            />
          </template>
        </el-table-column>
        <el-table-column prop="preferred_glaze" label="偏好釉色" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.preferred_glaze" :color="row.preferred_glaze" effect="dark" style="color: #fff;">
              {{ row.preferred_glaze }}
            </el-tag>
            <span v-else style="color: #999;">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学员' : '新增学员'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <div class="form-row">
          <el-form-item label="姓名" required>
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="form.phone" placeholder="请输入电话" />
          </el-form-item>
          <el-form-item label="微信号">
            <el-input v-model="form.wechat" placeholder="请输入微信号" />
          </el-form-item>
          <el-form-item label="课程次数">
            <el-input-number v-model="form.course_count" :min="0" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="已用次数">
            <el-input-number v-model="form.used_count" :min="0" :max="form.course_count" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="偏好釉色">
            <el-color-picker v-model="form.preferred_glaze" show-alpha />
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" />
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
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { db } from '../utils/api'

const students = ref([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const stats = ref({
  total: 0,
  active: 0,
  totalCourses: 0,
  worksCount: 0
})

const form = ref({
  name: '',
  phone: '',
  wechat: '',
  course_count: 0,
  used_count: 0,
  preferred_glaze: '',
  notes: ''
})

const filteredStudents = computed(() => {
  if (!searchKeyword.value) return students.value
  const kw = searchKeyword.value.toLowerCase()
  return students.value.filter(s => 
    s.name.toLowerCase().includes(kw) ||
    (s.phone && s.phone.includes(kw)) ||
    (s.wechat && s.wechat.toLowerCase().includes(kw))
  )
})

async function loadData() {
  students.value = await db.getAll('students')
  stats.value.total = students.value.length
  stats.value.active = students.value.filter(s => s.course_count > s.used_count).length
  stats.value.totalCourses = students.value.reduce((sum, s) => sum + (s.course_count - s.used_count), 0)
  
  const works = await db.query("SELECT COUNT(*) as cnt FROM works WHERE status != 'picked'")
  stats.value.worksCount = works[0]?.cnt || 0
}

function handleAdd() {
  isEdit.value = false
  editId.value = null
  form.value = {
    name: '',
    phone: '',
    wechat: '',
    course_count: 0,
    used_count: 0,
    preferred_glaze: '',
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

async function handleSave() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入姓名')
    return
  }
  
  try {
    if (isEdit.value) {
      await db.update('students', editId.value, form.value)
      ElMessage.success('修改成功')
    } else {
      await db.create('students', form.value)
      ElMessage.success('添加成功')
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
    await ElMessageBox.confirm(`确定要删除学员"${row.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    await db.remove('students', row.id)
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
