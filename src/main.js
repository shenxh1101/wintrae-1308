import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {
  User, Picture, TrendCharts, Goods, Warning, Plus, Search, Edit, Delete, Camera, Close, ArrowLeft, ArrowRight, ArrowDown, Refresh, ChatDotRound, List
} from '@element-plus/icons-vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

const icons = {
  User, Picture, TrendCharts, Goods, Warning, Plus, Search, Edit, Delete, Camera, Close, ArrowLeft, ArrowRight, ArrowDown, Refresh, ChatDotRound, List, DataLine: TrendCharts, Alarm: Warning, Bell: Warning, Wallet: Goods, Money: Goods, Odometer: TrendCharts
}

for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.mount('#app')
