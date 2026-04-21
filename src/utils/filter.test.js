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
