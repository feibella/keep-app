<template>
  <div class="app">
    <router-view class="page-view" />
    <van-tabbar route :border="true" active-color="var(--primary)" inactive-color="var(--text-3)">
      <van-tabbar-item replace to="/courses" icon="apps-o">课程</van-tabbar-item>
      <van-tabbar-item replace to="/records" icon="bar-chart-o">记录</van-tabbar-item>
      <van-tabbar-item replace to="/manage" icon="setting-o">管理</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { loadSettings } from './utils/settings'

// 预热 AList，避免 Railway 休眠后首次访问延迟
onMounted(() => {
  const s = loadSettings()
  if (!s.alistUrl) return
  const base = s.alistUrl.replace(/\/$/, '')
  fetch(`${base}/ping`, { method: 'GET', mode: 'no-cors' }).catch(() => {})
})
</script>
