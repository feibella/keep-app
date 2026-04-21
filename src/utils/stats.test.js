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
    expect(s.totalMinutes).toBe(46)
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
