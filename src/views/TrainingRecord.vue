<template>
  <div class="page-records">
    <van-nav-bar title="记录" :border="false" />

    <van-tabs v-model:active="activePeriod" shrink sticky>
      <van-tab v-for="p in PERIODS" :key="p.value" :title="p.label" :name="p.value" />
    </van-tabs>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ stats.completions }}</div>
        <div class="stat-label">完成次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalMinutes }}</div>
        <div class="stat-label">总分钟</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.uniqueDays }}</div>
        <div class="stat-label">累计天数</div>
      </div>
    </div>

    <!-- 训练日志 -->
    <div class="log-list">
      <div v-for="group in grouped" :key="group.date" class="log-group">
        <div class="log-date">{{ fmtDate(group.date) }}</div>
        <van-cell-group inset>
          <van-cell
            v-for="log in group.items"
            :key="log.id"
            :title="log.courseName"
            :value="formatDuration(log.actualDuration)"
            value-class="log-dur-cell"
          />
        </van-cell-group>
      </div>
      <van-empty v-if="!grouped.length" description="暂无训练记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTrainingStore } from '../stores/training'
import { computeStats, filterLogsByPeriod, groupLogsByDate, formatDuration } from '../utils/stats'

const PERIODS = [
  { value: 'week',  label: '周' },
  { value: 'month', label: '月' },
  { value: 'year',  label: '年' },
  { value: 'total', label: '总' },
]

const store        = useTrainingStore()
const activePeriod = ref('total')

const stats   = computed(() => computeStats(store.logs, activePeriod.value))
const grouped = computed(() => groupLogsByDate(filterLogsByPeriod(store.logs, activePeriod.value)))

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
</script>
