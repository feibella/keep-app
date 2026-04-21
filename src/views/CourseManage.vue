<template>
  <div class="page-manage">
    <!-- 顶部操作栏 -->
    <van-nav-bar title="管理" :border="false">
      <template #right>
        <van-button type="primary" size="small" @click="openForm(null)">+ 添加</van-button>
      </template>
    </van-nav-bar>

    <!-- 批量操作工具栏 -->
    <div class="toolbar-row">
      <van-button plain size="small" type="primary" @click="importFromAList" :disabled="!settings.alistUrl">☁️ 从 AList 导入</van-button>
      <van-button plain size="small" @click="batchImport">📂 本地</van-button>
      <van-button plain size="small" @click="jsonInput.click()">⬆ JSON</van-button>
      <van-button plain size="small" @click="exportJSON" :disabled="!store.courses.length">⬇ 导出</van-button>
    </div>

    <!-- AList 设置 -->
    <van-cell-group inset class="alist-group">
      <van-cell
        title="AList 视频设置"
        is-link
        :value="settings.alistUrl ? '已配置' : '未配置'"
        :value-class="settings.alistUrl ? 'cell-ok' : 'cell-off'"
        @click="showAlist = !showAlist"
      />
      <template v-if="showAlist">
        <van-field
          v-model="settings.alistUrl"
          label="AList 网址"
          placeholder="https://my-alist.onrender.com"
          @input="saveSettingsData"
        />
        <van-field
          v-model="settings.alistFolder"
          label="文件夹路径"
          placeholder="/keep课程"
          @input="saveSettingsData"
        />
        <div class="alist-hint-row">配置后点「开始训练」将在 app 内直接播放视频</div>
      </template>
    </van-cell-group>

    <!-- 课程列表 -->
    <van-cell-group inset class="course-manage-group">
      <van-cell
        v-for="course in store.courses"
        :key="course.id"
        :title="course.name"
        :label="course.level + ' · ' + course.type + ' · ' + course.bodyPart"
      >
        <template #right-icon>
          <div class="cell-actions">
            <van-button size="mini" plain @click.stop="openForm(course)">编辑</van-button>
            <van-button size="mini" plain type="danger" @click.stop="confirmDelete(course)">删除</van-button>
          </div>
        </template>
      </van-cell>
      <van-empty v-if="!store.courses.length" description="还没有课程，点击「+ 添加」开始" />
    </van-cell-group>

    <!-- 添加/编辑弹出表单 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ maxHeight: '92dvh' }">
      <form @submit.prevent="submitForm">
        <div class="form-header">
          <span class="form-title">{{ editingId ? '编辑课程' : '添加课程' }}</span>
          <van-button plain size="small" type="button" @click="showForm = false">取消</van-button>
        </div>
        <van-cell-group>
          <van-field v-model="form.name" label="课程名称" placeholder="HIIT 全身燃脂·热汗初级" required />
          <van-field v-model="form.level"    label="训练等级" readonly is-link @click="openPicker('level')" />
          <van-field v-model="form.type"     label="训练类型" readonly is-link @click="openPicker('type')" />
          <van-field v-model="form.bodyPart" label="训练部位" readonly is-link @click="openPicker('bodyPart')" />
          <van-field v-model.number="form.durationMin" label="预估时长" type="number" placeholder="20">
            <template #right-icon><span class="field-unit">分钟</span></template>
          </van-field>
          <van-field v-model="form.fileName"  label="视频文件名"  placeholder="K2 HIIT 全身燃脂.热汗初级.mov" />
          <van-field v-model="form.baiduLink" label="百度网盘链接" placeholder="https://pan.baidu.com/s/..." />
        </van-cell-group>
        <div class="form-footer">
          <button type="submit" class="btn-primary">保存</button>
        </div>
      </form>
    </van-popup>

    <!-- 选项 Picker -->
    <van-popup v-model:show="pickerVisible" position="bottom" round>
      <van-picker
        :columns="currentPickerColumns"
        @confirm="onPickerConfirm"
        @cancel="pickerVisible = false"
      />
    </van-popup>

    <!-- 批量预览弹出 -->
    <van-popup v-model:show="showPreviewSheet" position="bottom" round :style="{ maxHeight: '85dvh' }">
      <div class="form-header">
        <span class="form-title">识别到 {{ preview.length }} 个课程</span>
        <van-button plain size="small" @click="showPreviewSheet = false">取消</van-button>
      </div>
      <div class="preview-scroll">
        <van-cell-group>
          <van-cell v-for="(c, i) in preview" :key="i" :title="c.name" :label="c.level + ' · ' + c.type + ' · ' + c.bodyPart">
            <template #right-icon>
              <van-button size="mini" plain type="danger" @click="preview.splice(i, 1)">移除</van-button>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="form-footer">
        <button class="btn-primary" @click="confirmImport">全部保存（{{ preview.length }} 个）</button>
      </div>
    </van-popup>

    <!-- 隐藏 inputs -->
    <input ref="jsonInput"      type="file" accept=".json"   style="display:none" @change="importJSON" />
    <input ref="multiFileInput" type="file" accept="video/*" multiple style="display:none" @change="onMultiFile" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { showConfirmDialog } from 'vant'
import { useCoursesStore } from '../stores/courses'
import { parseFilename } from '../utils/parse'
import { loadSettings, saveSettings } from '../utils/settings'

const LEVELS     = ['K1', 'K2', 'K3', 'K4']
const TYPES      = ['HIIT', 'Tabata', '拉伸', '核心', '其他']
const BODY_PARTS = ['全身', '腰腹', '臀腿', '核心', '手臂']

const store           = useCoursesStore()
const showForm        = ref(false)
const editingId       = ref(null)
const preview         = ref([])
const showPreviewSheet = ref(false)
const jsonInput       = ref(null)
const multiFileInput  = ref(null)
const showAlist       = ref(false)
const pickerVisible   = ref(false)
const pickerField     = ref('')
const settings        = reactive(loadSettings())
const form = reactive({ name: '', level: 'K1', type: 'HIIT', bodyPart: '全身', durationMin: 20, fileName: '', baiduLink: '' })

// ── Picker ───────────────────────────────────────────────────────
const pickerColumnsMap = {
  level:    LEVELS.map(v => ({ text: v, value: v })),
  type:     TYPES.map(v => ({ text: v, value: v })),
  bodyPart: BODY_PARTS.map(v => ({ text: v, value: v })),
}
const currentPickerColumns = computed(() => pickerColumnsMap[pickerField.value] || [])

function openPicker(field) { pickerField.value = field; pickerVisible.value = true }
function onPickerConfirm({ selectedValues }) {
  form[pickerField.value] = selectedValues[0]
  pickerVisible.value = false
}

// ── Settings ─────────────────────────────────────────────────────
function saveSettingsData() {
  saveSettings({ alistUrl: settings.alistUrl, alistFolder: settings.alistFolder })
}

// ── Single add/edit ──────────────────────────────────────────────
function openForm(course) {
  if (course) {
    editingId.value = course.id
    Object.assign(form, course)
  } else {
    editingId.value = null
    Object.assign(form, { name: '', level: 'K1', type: 'HIIT', bodyPart: '全身', durationMin: 20, fileName: '', baiduLink: '' })
  }
  showForm.value = true
}

function submitForm() {
  if (!form.name) return
  if (editingId.value) store.updateCourse(editingId.value, { ...form })
  else                  store.addCourse({ ...form })
  showForm.value = false
}

async function confirmDelete(course) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `删除「${course.name}」？`,
      confirmButtonText: '删除',
      confirmButtonColor: '#ee0a24',
    })
    store.deleteCourse(course.id)
  } catch { /* cancelled */ }
}

// ── AList import ─────────────────────────────────────────────────
async function importFromAList() {
  if (!settings.alistUrl) { alert('请先配置 AList 网址'); return }
  try {
    const base = settings.alistUrl.replace(/\/$/, '')
    const folder = settings.alistFolder || '/'
    const res = await fetch(`${base}/api/fs/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folder, password: '', page: 1, per_page: 500, refresh: false })
    })
    const data = await res.json()
    if (data.code !== 200) { alert('AList 错误：' + (data.message || '未知')); return }
    const files = (data.data?.content || []).filter(f => !f.is_dir && /\.(mov|mp4|m4v|avi|mkv)$/i.test(f.name))
    if (!files.length) { alert('文件夹里没有视频文件'); return }
    const existing = new Set(store.courses.map(c => c.name))
    const parsed = files.map(f => parseFilename(f.name)).filter(c => !existing.has(c.name))
    if (!parsed.length) { alert(`已全部存在（共 ${files.length} 个视频）`); return }
    preview.value = parsed
    showPreviewSheet.value = true
  } catch (e) {
    alert('连接失败：' + e.message + '\n请检查 AList 网址是否正确、能否访问')
  }
}

// ── Batch import ─────────────────────────────────────────────────
async function batchImport() {
  if (window.showDirectoryPicker) {
    try {
      const dir   = await window.showDirectoryPicker()
      const names = []
      for await (const [name] of dir.entries()) {
        if (/\.(mov|mp4|m4v)$/i.test(name)) names.push(name)
      }
      if (!names.length) { alert('未找到视频文件'); return }
      showPreview(names)
    } catch (e) { if (e.name !== 'AbortError') alert(e.message) }
  } else {
    multiFileInput.value.click()
  }
}

function onMultiFile(e) {
  const names = Array.from(e.target.files).map(f => f.name)
  multiFileInput.value.value = ''
  if (names.length) showPreview(names)
}

function showPreview(names) {
  const existing = new Set(store.courses.map(c => c.name))
  preview.value  = names.map(parseFilename).filter(c => !existing.has(c.name))
  showPreviewSheet.value = true
}

function confirmImport() {
  preview.value.forEach(c => store.addCourse(c))
  preview.value = []
  showPreviewSheet.value = false
}

// ── Export / Import JSON ──────────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(store.courses, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'courses.json'; a.click()
  URL.revokeObjectURL(url)
}

function importJSON(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    try {
      const courses = JSON.parse(ev.target.result)
      if (!Array.isArray(courses)) throw new Error()
      const existing = new Set(store.courses.map(c => c.name))
      const toAdd    = courses.filter(c => c.name && !existing.has(c.name))
      toAdd.forEach(c => store.addCourse(c))
      alert(`已导入 ${toAdd.length} 个课程`)
    } catch { alert('JSON 格式有误') }
    jsonInput.value.value = ''
  }
  reader.readAsText(file)
}
</script>
