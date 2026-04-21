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
