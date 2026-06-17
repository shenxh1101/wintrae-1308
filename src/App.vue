<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <span class="logo-icon">🏺</span>
        <h1 class="app-title">陶艺工作室管理系统</h1>
      </div>
      <div class="header-right">
        <span class="header-date">{{ currentDate }}</span>
      </div>
    </el-header>
    
    <el-container>
      <el-aside width="220px" class="app-aside">
        <el-menu
          :default-active="activeTab"
          class="side-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="students">
            <el-icon><User /></el-icon>
            <span>学员档案</span>
          </el-menu-item>
          <el-menu-item index="works">
            <el-icon><Picture /></el-icon>
            <span>作品看板</span>
          </el-menu-item>
          <el-menu-item index="kilns">
            <el-icon><TrendCharts /></el-icon>
            <span>窑炉排期</span>
          </el-menu-item>
          <el-menu-item index="fees">
            <el-icon><Goods /></el-icon>
            <span>费用记录</span>
          </el-menu-item>
          <el-menu-item index="reminders">
            <el-icon><Warning /></el-icon>
            <span>取件提醒</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="app-main">
        <StudentProfile v-if="activeTab === 'students'" />
        <WorkBoard v-else-if="activeTab === 'works'" />
        <KilnSchedule v-else-if="activeTab === 'kilns'" />
        <FeeRecords v-else-if="activeTab === 'fees'" />
        <PickupReminder v-else-if="activeTab === 'reminders'" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import StudentProfile from './components/StudentProfile.vue'
import WorkBoard from './components/WorkBoard.vue'
import KilnSchedule from './components/KilnSchedule.vue'
import FeeRecords from './components/FeeRecords.vue'
import PickupReminder from './components/PickupReminder.vue'

const activeTab = ref('students')

const currentDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

function handleMenuSelect(index) {
  activeTab.value = index
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.app-title {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 2px;
}

.header-date {
  color: #ecf0f1;
  font-size: 14px;
}

.app-aside {
  background: #fff;
  border-right: 1px solid #e0e0e0;
}

.side-menu {
  border-right: none;
  height: 100%;
  padding-top: 20px;
}

.side-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 4px 12px;
  border-radius: 8px;
  font-size: 15px;
}

.side-menu .el-menu-item:hover {
  background: #f0f4f8;
}

.side-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.side-menu .el-menu-item.is-active .el-icon {
  color: #fff;
}

.app-main {
  padding: 0;
  background: #f5f7fa;
  overflow: hidden;
}
</style>
