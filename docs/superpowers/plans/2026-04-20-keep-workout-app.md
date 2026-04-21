# Keep 个人训练工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Vue 3 PWA for browsing, playing, and logging Keep workout videos on mobile.

**Architecture:** Vue 3 + Vite with Pinia stores for course catalog and training logs, all persisted to localStorage. Video playback uses browser-native `<video>` with `<input type="file">` per session. Three bottom-tab pages: CourseList, TrainingRecord, CourseManage.

**Tech Stack:** Vue 3, Vue Router 4, Pinia, Vite 5, vite-plugin-pwa, Vitest

---

## File Map

```
keep类应用/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── icon.svg
└── src/
    ├── main.js
    ├── App.vue                  # Root: bottom tab nav + router-view
    ├── style.css                # Global CSS variables + all component styles
    ├── router/
    │   └── index.js             # Hash-mode router, 3 routes
    ├── stores/
    │   ├── courses.js           # Course CRUD + localStorage sync
    │   └── training.js          # TrainingLog CRUD + localStorage sync
    ├── utils/
    │   ├── storage.js           # localStorage read/write wrappers
    │   ├── filter.js            # filterCourses pure function
    │   ├── filter.test.js
    │   ├── stats.js             # formatDuration, getDateRange, filterLogsByPeriod, computeStats, groupLogsByDate
    │   └── stats.test.js
    ├── views/
    │   ├── CourseList.vue       # Filter chips + course cards + launch VideoPlayer
    │   ├── TrainingRecord.vue   # Period tabs + stats + log list
    │   └── CourseManage.vue     # Course CRUD + bottom sheet form
    └── components/
        ├── FilterChips.vue      # Three rows of multi-select chips
        ├── CourseCard.vue       # Single course card with play button
        └── VideoPlayer.vue      # Fullscreen video + timer + completion modal
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `public/icon.svg`

- [ ] **Step 1: Initialize project**

```bash
cd "c:/Users/liufei12/Desktop/my-project/keep类应用"
npm create vite@latest . -- --template vue
```

When prompted "Current directory is not empty", select **Ignore files and continue**.

- [ ] **Step 2: Install dependencies**

```bash
npm install pinia vue-router
npm install -D vite-plugin-pwa vitest jsdom @vue/test-utils
```

- [ ] **Step 3: Replace `vite.config.js`**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '我的训练',
        short_name: '训练',
        theme_color: '#6B5EF8',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg}'] }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true
  }
})
```

- [ ] **Step 4: Replace `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <link rel="apple-touch-icon" href="/icon.svg" />
    <title>我的训练</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `public/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#6B5EF8"/>
  <rect x="22" y="38" width="56" height="9" rx="4.5" fill="white"/>
  <rect x="22" y="54" width="38" height="9" rx="4.5" fill="white" opacity="0.75"/>
  <circle cx="74" cy="32" r="11" fill="white" opacity="0.9"/>
</svg>
```

- [ ] **Step 6: Add test script to `package.json`**

Open `package.json`, add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server running at `http://localhost:5173`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vue 3 + Vite + PWA project"
```

---

## Task 2: Utility Functions (TDD)

**Files:**
- Create: `src/utils/storage.js`, `src/utils/filter.js`, `src/utils/filter.test.js`, `src/utils/stats.js`, `src/utils/stats.test.js`

- [ ] **Step 1: Create `src/utils/storage.js`**

```javascript
const COURSES_KEY = 'keepapp_courses'
const LOGS_KEY = 'keepapp_logs'

export function loadCourses() {
  try { return JSON.parse(localStorage.getItem(COURSES_KEY) || '[]') }
  catch { return [] }
}
export function saveCourses(courses) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
}
export function loadLogs() {
  try { return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]') }
  catch { return [] }
}
export function saveLogs(logs) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}
```

- [ ] **Step 2: Write `src/utils/filter.test.js`**

```javascript
import { describe, it, expect } from 'vitest'
import { filterCourses } from './filter'

const courses = [
  { id: '1', level: 'K1', type: 'HIIT',   bodyPart: '全身' },
  { id: '2', level: 'K2', type: 'Tabata', bodyPart: '腰腹' },
  { id: '3', level: 'K2', type: 'HIIT',   bodyPart: '全身' },
]

describe('filterCourses', () => {
  it('returns all when no filters active', () => {
    expect(filterCourses(courses, { levels: [], types: [], bodyParts: [] })).toHaveLength(3)
  })
  it('filters by single level', () => {
    const r = filterCourses(courses, { levels: ['K1'], types: [], bodyParts: [] })
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('1')
  })
  it('filters by multiple levels (OR within row)', () => {
    const r = filterCourses(courses, { levels: ['K1', 'K2'], types: [], bodyParts: [] })
    expect(r).toHaveLength(3)
  })
  it('combines level + type (AND between rows)', () => {
    const r = filterCourses(courses, { levels: ['K2'], types: ['HIIT'], bodyParts: [] })
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('3')
  })
  it('returns empty when no match', () => {
    expect(filterCourses(courses, { levels: ['K4'], types: [], bodyParts: [] })).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npm test
```

Expected: FAIL with "Cannot find module './filter'"

- [ ] **Step 4: Create `src/utils/filter.js`**

```javascript
export function filterCourses(courses, { levels, types, bodyParts }) {
  return courses.filter(c => {
    const levelOk  = levels.length    === 0 || levels.includes(c.level)
    const typeOk   = types.length     === 0 || types.includes(c.type)
    const bodyOk   = bodyParts.length === 0 || bodyParts.includes(c.bodyPart)
    return levelOk && typeOk && bodyOk
  })
}
```

- [ ] **Step 5: Write `src/utils/stats.test.js`**

```javascript
import { describe, it, expect } from 'vitest'
import { formatDuration, getDateRange, filterLogsByPeriod, computeStats, groupLogsByDate } from './stats'

describe('formatDuration', () => {
  it('formats 0 as 00:00', () => expect(formatDuration(0)).toBe('00:00'))
  it('formats 65 as 01:05', () => expect(formatDuration(65)).toBe('01:05'))
  it('formats 3600 as 60:00', () => expect(formatDuration(3600)).toBe('60:00'))
})

describe('getDateRange', () => {
  const today = new Date('2026-04-20T10:00:00')
  it('returns null for total',  () => expect(getDateRange('total', today)).toBeNull())
  it('returns 2026-04-20 for week (Monday)', () => expect(getDateRange('week', today)).toBe('2026-04-20'))
  it('returns 2026-04-01 for month', () => expect(getDateRange('month', today)).toBe('2026-04-01'))
  it('returns 2026-01-01 for year',  () => expect(getDateRange('year',  today)).toBe('2026-01-01'))
})

describe('computeStats', () => {
  const logs = [
    { id: '1', date: '2026-04-20', actualDuration: 600 },
    { id: '2', date: '2026-04-20', actualDuration: 720 },
    { id: '3', date: '2026-04-18', actualDuration: 240 },
    { id: '4', date: '2026-01-10', actualDuration: 1200 },
  ]
  const today = new Date('2026-04-20T10:00:00')

  it('total: counts all logs', () => {
    const s = computeStats(logs, 'total', today)
    expect(s.completions).toBe(4)
    expect(s.totalMinutes).toBe(46)   // (600+720+240+1200)/60 = 46
    expect(s.uniqueDays).toBe(3)
  })
  it('month: excludes January', () => {
    const s = computeStats(logs, 'month', today)
    expect(s.completions).toBe(3)
    expect(s.uniqueDays).toBe(2)
  })
})

describe('groupLogsByDate', () => {
  it('groups and sorts descending', () => {
    const logs = [
      { id: '1', date: '2026-04-18', courseName: 'A' },
      { id: '2', date: '2026-04-20', courseName: 'B' },
      { id: '3', date: '2026-04-20', courseName: 'C' },
    ]
    const groups = groupLogsByDate(logs)
    expect(groups[0].date).toBe('2026-04-20')
    expect(groups[0].items).toHaveLength(2)
    expect(groups[1].date).toBe('2026-04-18')
  })
})
```

- [ ] **Step 6: Create `src/utils/stats.js`**

```javascript
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function getDateRange(period, today = new Date()) {
  if (period === 'total') return null
  const d = new Date(today)
  if (period === 'week') {
    const day = d.getDay() === 0 ? 7 : d.getDay()
    d.setDate(d.getDate() - day + 1)
  } else if (period === 'month') {
    d.setDate(1)
  } else if (period === 'year') {
    d.setMonth(0, 1)
  }
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function filterLogsByPeriod(logs, period, today = new Date()) {
  const startDate = getDateRange(period, today)
  if (!startDate) return logs
  return logs.filter(log => log.date >= startDate)
}

export function computeStats(logs, period, today = new Date()) {
  const filtered = filterLogsByPeriod(logs, period, today)
  return {
    completions:  filtered.length,
    totalMinutes: Math.round(filtered.reduce((s, l) => s + l.actualDuration, 0) / 60),
    uniqueDays:   new Set(filtered.map(l => l.date)).size
  }
}

export function groupLogsByDate(logs) {
  const map = {}
  for (const log of logs) {
    if (!map[log.date]) map[log.date] = []
    map[log.date].push(log)
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }))
}
```

- [ ] **Step 7: Run tests — expect all PASS**

```bash
npm test
```

Expected: All 11 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/utils/
git commit -m "feat: add storage, filter, stats utils with tests"
```

---

## Task 3: Pinia Stores

**Files:**
- Create: `src/stores/courses.js`, `src/stores/training.js`

- [ ] **Step 1: Create `src/stores/courses.js`**

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadCourses, saveCourses } from '../utils/storage'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref(loadCourses())

  function addCourse(data) {
    const course = { ...data, id: crypto.randomUUID() }
    courses.value.push(course)
    saveCourses(courses.value)
  }

  function updateCourse(id, data) {
    const i = courses.value.findIndex(c => c.id === id)
    if (i !== -1) {
      courses.value[i] = { ...courses.value[i], ...data }
      saveCourses(courses.value)
    }
  }

  function deleteCourse(id) {
    courses.value = courses.value.filter(c => c.id !== id)
    saveCourses(courses.value)
  }

  return { courses, addCourse, updateCourse, deleteCourse }
})
```

- [ ] **Step 2: Create `src/stores/training.js`**

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadLogs, saveLogs } from '../utils/storage'

export const useTrainingStore = defineStore('training', () => {
  const logs = ref(loadLogs())

  function addLog(data) {
    const log = { ...data, id: crypto.randomUUID() }
    logs.value.unshift(log)
    saveLogs(logs.value)
  }

  return { logs, addLog }
})
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/
git commit -m "feat: add courses and training Pinia stores"
```

---

## Task 4: App Shell + Router + Global Styles

**Files:**
- Create/replace: `src/main.js`, `src/router/index.js`, `src/App.vue`, `src/style.css`
- Delete: `src/components/HelloWorld.vue`, `src/assets/vue.svg` (Vite template defaults)

- [ ] **Step 1: Delete template defaults**

```bash
rm -f src/components/HelloWorld.vue src/assets/vue.svg public/vite.svg
```

- [ ] **Step 2: Create `src/router/index.js`**

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'
import CourseList     from '../views/CourseList.vue'
import TrainingRecord from '../views/TrainingRecord.vue'
import CourseManage   from '../views/CourseManage.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',         redirect: '/courses' },
    { path: '/courses',  component: CourseList },
    { path: '/records',  component: TrainingRecord },
    { path: '/manage',   component: CourseManage },
  ]
})
```

- [ ] **Step 3: Replace `src/main.js`**

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './App.vue'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

- [ ] **Step 4: Replace `src/App.vue`**

```vue
<template>
  <div class="app">
    <router-view class="page-view" />
    <nav class="bottom-nav">
      <router-link to="/courses" class="nav-item">
        <span class="nav-icon">📋</span>
        <span class="nav-label">课程</span>
      </router-link>
      <router-link to="/records" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">记录</span>
      </router-link>
      <router-link to="/manage" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">管理</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup></script>
```

- [ ] **Step 5: Replace `src/style.css`** (full file)

```css
:root {
  --primary: #6B5EF8;
  --primary-light: #EEF0FF;
  --bg: #F5F5F7;
  --surface: #FFFFFF;
  --border: #E5E5E7;
  --text: #1A1A1A;
  --text-2: #8E8E93;
  --danger: #FF3B30;
  --green: #34C759;
  --orange: #FF9500;
  --radius: 12px;
  --radius-sm: 8px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  max-width: 430px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
}

.app { display: flex; flex-direction: column; height: 100dvh; }
.page-view { flex: 1; overflow-y: auto; }

/* ── Bottom Nav ── */
.bottom-nav {
  display: flex;
  background: var(--surface);
  border-top: 1px solid var(--border);
  height: 56px;
  flex-shrink: 0;
}
.nav-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-decoration: none; color: var(--text-2);
  font-size: 11px; gap: 2px; transition: color .15s;
}
.nav-item.router-link-active { color: var(--primary); }
.nav-icon { font-size: 22px; line-height: 1; }

/* ── Page layout ── */
.page { padding: 0 16px 24px; }
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 0 12px;
}
.page-header h1 { font-size: 26px; font-weight: 700; }

/* ── Filter Chips ── */
.filter-wrap { background: var(--surface); padding: 8px 16px 4px; }
.filter-row {
  display: flex; gap: 8px; overflow-x: auto;
  padding-bottom: 8px; scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }
.chip {
  flex-shrink: 0; padding: 5px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text); font-size: 13px; cursor: pointer; transition: all .15s;
}
.chip.active { background: var(--primary); border-color: var(--primary); color: #fff; }

/* ── Course Card ── */
.course-list { padding: 8px 0; }
.course-card {
  background: var(--surface); border-radius: var(--radius);
  padding: 14px 16px; margin: 0 16px 10px;
  display: flex; flex-direction: column; gap: 8px;
}
.course-meta { display: flex; gap: 6px; align-items: center; }
.badge {
  padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 600; flex-shrink: 0;
}
.badge-level  { background: var(--primary-light); color: var(--primary); }
.badge-type   { background: #F0FFF4; color: var(--green); }
.badge-body   { background: #FFF3E0; color: var(--orange); }
.course-duration { margin-left: auto; font-size: 13px; color: var(--text-2); }
.course-name { font-size: 16px; font-weight: 600; }
.btn-play {
  align-self: flex-end; background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius-sm);
  padding: 8px 20px; font-size: 14px; cursor: pointer;
}

/* ── Stats ── */
.period-tabs {
  display: flex; background: var(--surface);
  border-radius: var(--radius); margin: 16px 16px 8px; padding: 3px;
}
.tab {
  flex: 1; padding: 7px; border: none; background: transparent;
  border-radius: var(--radius-sm); font-size: 14px; cursor: pointer;
  color: var(--text-2); transition: all .15s;
}
.tab.active { background: var(--primary); color: #fff; font-weight: 600; }

.stats-row { display: flex; gap: 10px; padding: 0 16px 16px; }
.stat-card {
  flex: 1; background: var(--surface); border-radius: var(--radius);
  padding: 14px 10px; text-align: center;
}
.stat-value { font-size: 22px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 11px; color: var(--text-2); margin-top: 4px; }

/* ── Log List ── */
.log-list { padding: 0 16px; }
.log-group { margin-bottom: 16px; }
.log-date { font-size: 13px; color: var(--text-2); margin-bottom: 6px; font-weight: 500; }
.log-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 14px; background: var(--surface);
  border-radius: var(--radius-sm); margin-bottom: 6px;
}
.log-name { font-size: 14px; }
.log-dur  { font-size: 14px; color: var(--text-2); }

/* ── Manage ── */
.manage-list { padding: 0 16px; }
.manage-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 14px; background: var(--surface);
  border-radius: var(--radius-sm); margin-bottom: 8px;
}
.manage-info  { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.manage-name  { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.manage-acts  { display: flex; gap: 6px; flex-shrink: 0; }
.btn-icon     { background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px; }
.btn-add {
  background: var(--primary); color: #fff; border: none;
  border-radius: var(--radius-sm); padding: 8px 16px; font-size: 14px; cursor: pointer;
}

/* ── Sheet / Form ── */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: flex-end; z-index: 100;
}
.sheet {
  background: var(--surface); border-radius: var(--radius) var(--radius) 0 0;
  padding: 24px; width: 100%; display: flex; flex-direction: column; gap: 10px;
  max-height: 90dvh; overflow-y: auto;
}
.sheet h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.form-label { font-size: 13px; color: var(--text-2); margin-top: 6px; }
.form-input, .form-select {
  width: 100%; padding: 10px 12px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); font-size: 15px; background: var(--bg);
  color: var(--text);
}
.form-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center; z-index: 110;
}
.modal {
  background: var(--surface); border-radius: var(--radius);
  padding: 28px 24px; width: 300px;
  display: flex; flex-direction: column; gap: 12px; text-align: center;
}
.modal h3 { font-size: 20px; font-weight: 700; }
.modal-dur { font-size: 36px; font-weight: 700; color: var(--primary); }

/* ── Buttons ── */
.btn-primary {
  background: var(--primary); color: #fff; border: none;
  border-radius: var(--radius-sm); padding: 13px; font-size: 16px;
  cursor: pointer; width: 100%;
}
.btn-secondary {
  background: transparent; color: var(--text-2);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 13px; font-size: 16px; cursor: pointer; width: 100%;
}
.btn-danger {
  background: var(--danger); color: #fff; border: none;
  border-radius: var(--radius-sm); padding: 13px; font-size: 16px;
  cursor: pointer; width: 100%;
}

/* ── Video Player ── */
.video-player {
  position: fixed; inset: 0; background: #000; z-index: 200;
  display: flex; flex-direction: column;
}
.player-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; color: #fff; flex-shrink: 0;
}
.btn-back { background: none; border: none; color: #fff; font-size: 26px; cursor: pointer; }
.player-course-name { flex: 1; font-size: 16px; font-weight: 600; }
.video-area { flex: 1; display: flex; align-items: center; justify-content: center; }
.video-el { width: 100%; height: 100%; object-fit: contain; }
.select-prompt {
  color: #fff; text-align: center;
  display: flex; flex-direction: column; gap: 16px; align-items: center;
}
.select-prompt p { font-size: 16px; opacity: .7; }
.btn-select {
  background: var(--primary); color: #fff; border: none;
  border-radius: var(--radius-sm); padding: 12px 28px; font-size: 16px; cursor: pointer;
}
.player-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; flex-shrink: 0;
}
.timer { color: #fff; font-size: 34px; font-weight: 700; font-variant-numeric: tabular-nums; }
.btn-complete {
  background: var(--primary); color: #fff; border: none;
  border-radius: var(--radius-sm); padding: 10px 22px; font-size: 15px; cursor: pointer;
}

/* ── Empty state ── */
.empty { text-align: center; color: var(--text-2); padding: 48px 20px; font-size: 14px; }

/* ── Placeholder views ── */
.placeholder { padding: 40px 16px; color: var(--text-2); text-align: center; }
```

- [ ] **Step 6: Create placeholder view stubs** (so router doesn't break)

Create `src/views/CourseList.vue`:
```vue
<template><div class="placeholder">课程列表（即将完成）</div></template>
```

Create `src/views/TrainingRecord.vue`:
```vue
<template><div class="placeholder">训练记录（即将完成）</div></template>
```

Create `src/views/CourseManage.vue`:
```vue
<template><div class="placeholder">课程管理（即将完成）</div></template>
```

- [ ] **Step 7: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: white app, bottom tab nav with 3 tabs, tabs switch between placeholder text, no console errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: app shell, router, global styles"
```

---

## Task 5: Course Management Page

**Files:**
- Replace: `src/views/CourseManage.vue`

- [ ] **Step 1: Replace `src/views/CourseManage.vue`**

```vue
<template>
  <div>
    <div class="page">
      <div class="page-header">
        <h1>管理</h1>
        <button class="btn-add" @click="openForm(null)">+ 添加</button>
      </div>
    </div>

    <div class="manage-list">
      <div v-for="course in store.courses" :key="course.id" class="manage-item">
        <div class="manage-info">
          <span class="badge badge-level">{{ course.level }}</span>
          <span class="manage-name">{{ course.name }}</span>
        </div>
        <div class="manage-acts">
          <button class="btn-icon" @click="openForm(course)">✏️</button>
          <button class="btn-icon" @click="deleteTarget = course">🗑</button>
        </div>
      </div>
      <div v-if="!store.courses.length" class="empty">还没有课程，点击「添加」开始</div>
    </div>

    <!-- Add/Edit Sheet -->
    <div class="overlay" v-if="showForm" @click.self="showForm = false">
      <div class="sheet">
        <h3>{{ editingId ? '编辑课程' : '添加课程' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-label">课程名称</div>
          <input class="form-input" v-model="form.name" required placeholder="如：HIIT 全身燃脂·热汗初级" />

          <div class="form-label">训练等级</div>
          <select class="form-select" v-model="form.level">
            <option v-for="l in LEVELS"    :key="l" :value="l">{{ l }}</option>
          </select>

          <div class="form-label">训练类型</div>
          <select class="form-select" v-model="form.type">
            <option v-for="t in TYPES"     :key="t" :value="t">{{ t }}</option>
          </select>

          <div class="form-label">训练部位</div>
          <select class="form-select" v-model="form.bodyPart">
            <option v-for="b in BODY_PARTS" :key="b" :value="b">{{ b }}</option>
          </select>

          <div class="form-label">预估时长（分钟）</div>
          <input class="form-input" v-model.number="form.durationMin" type="number" min="1" required />

          <div class="form-actions">
            <button type="submit" class="btn-primary">保存</button>
            <button type="button" class="btn-secondary" @click="showForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div class="modal-overlay" v-if="deleteTarget">
      <div class="modal">
        <h3>确认删除？</h3>
        <p style="color:var(--text-2);font-size:14px">{{ deleteTarget.name }}</p>
        <button class="btn-danger" @click="doDelete">删除</button>
        <button class="btn-secondary" @click="deleteTarget = null">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useCoursesStore } from '../stores/courses'

const LEVELS     = ['K1', 'K2', 'K3', 'K4']
const TYPES      = ['HIIT', 'Tabata', '拉伸', '核心', '其他']
const BODY_PARTS = ['全身', '腰腹', '臀腿', '核心', '手臂']

const store       = useCoursesStore()
const showForm    = ref(false)
const editingId   = ref(null)
const deleteTarget = ref(null)
const form = reactive({ name: '', level: 'K1', type: 'HIIT', bodyPart: '全身', durationMin: 20 })

function openForm(course) {
  if (course) {
    editingId.value = course.id
    Object.assign(form, course)
  } else {
    editingId.value = null
    Object.assign(form, { name: '', level: 'K1', type: 'HIIT', bodyPart: '全身', durationMin: 20 })
  }
  showForm.value = true
}

function submitForm() {
  if (editingId.value) store.updateCourse(editingId.value, { ...form })
  else                  store.addCourse({ ...form })
  showForm.value = false
}

function doDelete() {
  store.deleteCourse(deleteTarget.value.id)
  deleteTarget.value = null
}
</script>
```

- [ ] **Step 2: Test manually**

Open `http://localhost:5173/#/manage`. Add a course. Edit it. Delete it. Verify data persists after page refresh.

- [ ] **Step 3: Commit**

```bash
git add src/views/CourseManage.vue
git commit -m "feat: course management page (add/edit/delete)"
```

---

## Task 6: Filter Chips + Course Card + Course List

**Files:**
- Create: `src/components/FilterChips.vue`, `src/components/CourseCard.vue`
- Replace: `src/views/CourseList.vue`

- [ ] **Step 1: Create `src/components/FilterChips.vue`**

```vue
<template>
  <div class="filter-wrap">
    <div class="filter-row">
      <button v-for="l in LEVELS"     :key="l" :class="chip('levels', l)"    @click="toggle('levels', l)">{{ l }}</button>
    </div>
    <div class="filter-row">
      <button v-for="t in TYPES"      :key="t" :class="chip('types', t)"     @click="toggle('types', t)">{{ t }}</button>
    </div>
    <div class="filter-row">
      <button v-for="b in BODY_PARTS" :key="b" :class="chip('bodyParts', b)" @click="toggle('bodyParts', b)">{{ b }}</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['change'])

const LEVELS     = ['K1', 'K2', 'K3', 'K4']
const TYPES      = ['HIIT', 'Tabata', '拉伸', '核心', '其他']
const BODY_PARTS = ['全身', '腰腹', '臀腿', '核心', '手臂']

const sel = reactive({ levels: [], types: [], bodyParts: [] })

function chip(dim, val) {
  return ['chip', sel[dim].includes(val) ? 'active' : '']
}
function toggle(dim, val) {
  const arr = sel[dim]
  const i = arr.indexOf(val)
  i === -1 ? arr.push(val) : arr.splice(i, 1)
  emit('change', { levels: [...sel.levels], types: [...sel.types], bodyParts: [...sel.bodyParts] })
}
</script>
```

- [ ] **Step 2: Create `src/components/CourseCard.vue`**

```vue
<template>
  <div class="course-card">
    <div class="course-meta">
      <span class="badge badge-level">{{ course.level }}</span>
      <span class="badge badge-type">{{ course.type }}</span>
      <span class="badge badge-body">{{ course.bodyPart }}</span>
      <span class="course-duration">{{ course.durationMin }}分钟</span>
    </div>
    <div class="course-name">{{ course.name }}</div>
    <button class="btn-play" @click="emit('play', course)">开始训练</button>
  </div>
</template>

<script setup>
defineProps({ course: Object })
const emit = defineEmits(['play'])
</script>
```

- [ ] **Step 3: Replace `src/views/CourseList.vue`**

```vue
<template>
  <div>
    <div class="page">
      <div class="page-header"><h1>课程</h1></div>
    </div>

    <FilterChips @change="filters = $event" />

    <div class="course-list">
      <CourseCard
        v-for="c in filtered"
        :key="c.id"
        :course="c"
        @play="active = c"
      />
      <div v-if="!filtered.length" class="empty">
        {{ courseStore.courses.length ? '没有符合条件的课程' : '请先在「管理」页添加课程' }}
      </div>
    </div>

    <VideoPlayer v-if="active" :course="active" @close="active = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCoursesStore } from '../stores/courses'
import { filterCourses } from '../utils/filter'
import FilterChips from '../components/FilterChips.vue'
import CourseCard  from '../components/CourseCard.vue'
import VideoPlayer from '../components/VideoPlayer.vue'

const courseStore = useCoursesStore()
const filters = ref({ levels: [], types: [], bodyParts: [] })
const active  = ref(null)

const filtered = computed(() => filterCourses(courseStore.courses, filters.value))
</script>
```

Note: `VideoPlayer` is imported here but created in Task 7. Until then, create a stub:

```bash
echo '<template><div></div></template>' > src/components/VideoPlayer.vue
```

- [ ] **Step 4: Test manually**

Go to `/#/courses`. Add a few courses via Manage tab. Verify they appear. Test chip filtering — selecting K2 should hide K1 courses. Multi-select within same row should OR them.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterChips.vue src/components/CourseCard.vue src/views/CourseList.vue
git commit -m "feat: course list page with multi-select filter chips"
```

---

## Task 7: Video Player

**Files:**
- Replace: `src/components/VideoPlayer.vue`

- [ ] **Step 1: Replace `src/components/VideoPlayer.vue`**

```vue
<template>
  <div class="video-player">
    <div class="player-header">
      <button class="btn-back" @click="close">←</button>
      <span class="player-course-name">{{ course.name }}</span>
    </div>

    <div class="video-area">
      <video
        v-if="videoSrc"
        ref="videoEl"
        class="video-el"
        :src="videoSrc"
        controls
        autoplay
        @ended="onEnded"
      />
      <div v-else class="select-prompt">
        <p>选择「{{ course.name }}」视频文件</p>
        <button class="btn-select" @click="fileInput.click()">选择文件</button>
      </div>
    </div>

    <div class="player-footer" v-if="videoSrc">
      <div class="timer">{{ formatDuration(elapsed) }}</div>
      <button class="btn-complete" @click="onComplete">完成训练</button>
    </div>

    <input ref="fileInput" type="file" accept="video/*" style="display:none" @change="onFile" />

    <!-- Completion modal -->
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
import { ref, onUnmounted } from 'vue'
import { useTrainingStore } from '../stores/training'
import { formatDuration } from '../utils/stats'

const props = defineProps({ course: Object })
const emit  = defineEmits(['close'])

const store     = useTrainingStore()
const fileInput = ref(null)
const videoEl   = ref(null)
const videoSrc  = ref(null)
const elapsed   = ref(0)
const showModal = ref(false)
let   timer     = null

function onFile(e) {
  const file = e.target.files[0]
  if (!file) return
  videoSrc.value = URL.createObjectURL(file)
  timer = setInterval(() => elapsed.value++, 1000)
}

function onEnded() {
  clearInterval(timer)
  showModal.value = true
}

function onComplete() {
  clearInterval(timer)
  showModal.value = true
}

function saveAndClose() {
  store.addLog({
    courseId:       props.course.id,
    courseName:     props.course.name,
    date:           new Date().toISOString().slice(0, 10),
    actualDuration: elapsed.value
  })
  cleanup()
}

function close() {
  clearInterval(timer)
  cleanup()
}

function cleanup() {
  if (videoSrc.value) URL.revokeObjectURL(videoSrc.value)
  emit('close')
}

onUnmounted(() => {
  clearInterval(timer)
  if (videoSrc.value) URL.revokeObjectURL(videoSrc.value)
})
</script>
```

- [ ] **Step 2: Test manually**

Go to Courses tab → tap "开始训练" on any card → select a `.mov` file → verify video plays, timer counts up → tap "完成训练" → modal appears with time → tap "保存记录" → go to Records tab → verify entry appears.

- [ ] **Step 3: Commit**

```bash
git add src/components/VideoPlayer.vue
git commit -m "feat: video player with file picker, timer, and log save"
```

---

## Task 8: Training Records Page

**Files:**
- Replace: `src/views/TrainingRecord.vue`

- [ ] **Step 1: Replace `src/views/TrainingRecord.vue`**

```vue
<template>
  <div>
    <div class="page">
      <div class="page-header"><h1>记录</h1></div>
    </div>

    <div class="period-tabs">
      <button
        v-for="p in PERIODS" :key="p.value"
        :class="['tab', activePeriod === p.value ? 'active' : '']"
        @click="activePeriod = p.value"
      >{{ p.label }}</button>
    </div>

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

    <div class="log-list">
      <div v-for="group in grouped" :key="group.date" class="log-group">
        <div class="log-date">{{ fmtDate(group.date) }}</div>
        <div v-for="log in group.items" :key="log.id" class="log-item">
          <span class="log-name">{{ log.courseName }}</span>
          <span class="log-dur">{{ formatDuration(log.actualDuration) }}</span>
        </div>
      </div>
      <div v-if="!grouped.length" class="empty">暂无训练记录</div>
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

const store       = useTrainingStore()
const activePeriod = ref('total')

const stats   = computed(() => computeStats(store.logs, activePeriod.value))
const grouped = computed(() => groupLogsByDate(filterLogsByPeriod(store.logs, activePeriod.value)))

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
</script>
```

- [ ] **Step 2: Test manually**

Add a few workouts via the player. Go to Records tab. Verify stats count correctly. Switch between 周/月/年/总 tabs — stats and list should filter accordingly.

- [ ] **Step 3: Commit**

```bash
git add src/views/TrainingRecord.vue
git commit -m "feat: training records page with period tabs and stats"
```

---

## Task 9: PWA Build + Phone Testing

**Files:**
- No new files; validate build and test on device.

- [ ] **Step 1: Build for production**

```bash
npm run build
```

Expected: `dist/` folder created with no errors.

- [ ] **Step 2: Preview build locally**

```bash
npm run preview
```

Open `http://localhost:4173` in browser. Verify all three tabs work and PWA manifest loads (DevTools → Application → Manifest).

- [ ] **Step 3: Serve on local network for phone testing**

```bash
npx serve dist --listen 5000
```

On your phone (same Wi-Fi), open `http://<your-computer-IP>:5000`. In Safari, tap Share → "添加到主屏幕". Verify app opens standalone (no browser chrome).

- [ ] **Step 4: End-to-end phone test checklist**

- [ ] Add a course via Manage tab
- [ ] Filter by level/type/bodyPart — results update correctly
- [ ] Tap "开始训练" → file picker opens → select a .mov file → video plays
- [ ] Timer counts up during playback
- [ ] Tap "完成训练" → modal shows elapsed time → save
- [ ] Records tab shows the new log entry
- [ ] Period tabs (周/月/年/总) switch correctly
- [ ] Close app and reopen — courses and logs persisted

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: production build verified, PWA installable"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Course list with filter chips (level × type × bodyPart)
- ✅ Video playback via file picker → native `<video>`
- ✅ Training log: date, course name, actual duration
- ✅ Stats summary: completions, total minutes, unique days
- ✅ Period tabs: 周/月/年/总
- ✅ Course management: add/edit/delete
- ✅ localStorage persistence
- ✅ PWA installable

**Type consistency:**
- `filterCourses` accepts `{ levels, types, bodyParts }` — matches FilterChips emit and CourseList ref ✅
- `computeStats` / `filterLogsByPeriod` / `groupLogsByDate` signatures match TrainingRecord usage ✅
- `store.addLog` / `store.addCourse` / `store.updateCourse` / `store.deleteCourse` match all usages ✅
- `formatDuration(seconds)` used consistently in VideoPlayer and TrainingRecord ✅
