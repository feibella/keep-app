const KEY = 'keepapp_settings'

const defaults = { alistUrl: '', alistFolder: '/keep课程' }

export function loadSettings() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') } }
  catch { return { ...defaults } }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function getStreamUrl(settings, fileName) {
  if (!settings.alistUrl || !fileName) return null
  const base   = settings.alistUrl.replace(/\/$/, '')
  const folder = settings.alistFolder.replace(/\/$/, '')
  return `${base}/d${folder}/${fileName}`
}
