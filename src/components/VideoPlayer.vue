<template>
  <div class="video-player">
    <div class="player-header">
      <button class="btn-back" @click="close">←</button>
      <span class="player-course-name">{{ course.name }}</span>
    </div>

    <!-- MODE 1: AList 直播流，app 内播放 -->
    <template v-if="streamUrl">
      <div class="video-area">
        <div v-if="videoLoading" class="video-loading">
          <div class="loading-spinner"></div>
          <p>视频加载中…</p>
          <p class="loading-hint">首次打开可能较慢，请稍候</p>
        </div>
        <video
          ref="videoEl"
          class="video-el"
          :src="streamUrl"
          controls
          autoplay
          playsinline
          @loadstart="videoLoading = true"
          @canplay="videoLoading = false"
          @playing="videoLoading = false"
          @error="onVideoError"
          @play="onVideoPlay"
          @ended="onEnded"
        />
      </div>
      <div class="player-footer player-footer--video">
        <span class="timer timer--small">{{ formatDuration(elapsed) }}</span>
        <button class="btn-complete" @click="onComplete" :disabled="!started">完成训练</button>
      </div>
    </template>

    <!-- MODE 2: 无 AList，计时 + 跳转外部 App -->
    <template v-else>
      <div class="workout-body">
        <div class="workout-timer">{{ formatDuration(elapsed) }}</div>
        <div class="workout-label">{{ started ? '训练中' : '准备开始' }}</div>

        <div class="workout-actions">
          <button class="btn-baidu" @click="openBaidu">
            {{ course.baiduLink ? '打开百度网盘播放' : '打开百度网盘' }}
          </button>
          <button class="btn-start-only" @click="startOnly" v-if="!started">
            仅计时（不打开网盘）
          </button>
        </div>

        <p class="workout-hint" v-if="started">
          {{ course.baiduLink ? '已跳转到对应视频，计时在此继续运行' : '在百度网盘找到「' + course.name + '」播放' }}
        </p>
        <p class="workout-hint no-link-tip" v-if="!started && !course.baiduLink">
          提示：配置 AList 或添加分享链接，可自动跳转视频
        </p>
      </div>

      <div class="player-footer">
        <button class="btn-complete" @click="onComplete" :disabled="!started">完成训练</button>
      </div>
    </template>

    <!-- 完成弹窗 -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal">
        <h3>训练完成 🎉</h3>
        <div class="modal-dur">{{ formatDuration(elapsed) }}</div>
        <p style="font-size:14px;color:var(--text-2)">{{ course.name }}</p>
        <button class="btn-primary" @click="saveAndClose">保存记录</button>
        <button class="btn-secondary" @click="showModal = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useTrainingStore } from '../stores/training'
import { formatDuration } from '../utils/stats'
import { loadSettings, getStreamUrl } from '../utils/settings'

const props = defineProps({ course: Object })
const emit  = defineEmits(['close'])

const store        = useTrainingStore()
const settings     = loadSettings()
const videoEl      = ref(null)
const elapsed      = ref(0)
const started      = ref(false)
const showModal    = ref(false)
const videoLoading = ref(false)
let   startTime = null
let   timer     = null

const streamUrl = computed(() => getStreamUrl(settings, props.course.fileName))

function beginTimer() {
  if (started.value) return
  startTime     = Date.now()
  started.value = true
  timer = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)
}

function onVideoPlay() { beginTimer() }
function onVideoError() {
  videoLoading.value = false
  alert('视频加载失败，请检查 AList 配置或稍后重试')
}

function openBaidu() {
  beginTimer()
  window.location.href = props.course.baiduLink || 'baiduyunguanjia://'
}

function startOnly()  { beginTimer() }
function onEnded()    { clearInterval(timer); showModal.value = true }
function onComplete() { clearInterval(timer); showModal.value = true }

function saveAndClose() {
  const now = new Date()
  const d   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  store.addLog({ courseId: props.course.id, courseName: props.course.name, date: d, actualDuration: elapsed.value })
  cleanup()
}

function close()   { clearInterval(timer); cleanup() }
function cleanup() { emit('close') }

onUnmounted(() => clearInterval(timer))
</script>
