import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadLogs, saveLogs } from '../utils/storage'

export const useTrainingStore = defineStore('training', () => {
  const logs = ref(loadLogs())

  function addLog(data) {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const log = { ...data, id }
    logs.value.unshift(log)
    saveLogs(logs.value)
  }

  return { logs, addLog }
})
