const LEVEL_RE    = /^(K[1-4])\s+/i
const DURATION_RE = /(\d+)\s*分钟/

const TYPE_KEYWORDS  = ['HIIT', 'Tabata', '拉伸', '核心']
const BODY_KEYWORDS  = ['腰腹', '臀腿', '手臂', '核心', '全身']

export function parseFilename(filename) {
  const base = filename.replace(/\.(mov|mp4|m4v|avi|mkv)$/i, '')

  const levelMatch = base.match(LEVEL_RE)
  const level = levelMatch ? levelMatch[1].toUpperCase() : 'K1'
  const rest  = levelMatch ? base.slice(levelMatch[0].length) : base

  let type = '其他'
  for (const kw of TYPE_KEYWORDS) {
    if (new RegExp(kw, 'i').test(rest)) { type = kw; break }
  }

  let bodyPart = '全身'
  for (const kw of BODY_KEYWORDS) {
    if (rest.includes(kw)) { bodyPart = kw; break }
  }

  const durMatch = base.match(DURATION_RE)
  const durationMin = durMatch ? parseInt(durMatch[1]) : 20

  const name = rest.replace(/\./g, '·').trim()

  return { name, level, type, bodyPart, durationMin, fileName: filename }
}
