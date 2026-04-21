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
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
