import { describe, it, expect } from 'vitest'
import { parseFilename } from './parse'

describe('parseFilename', () => {
  it('parses K2 HIIT 全身燃脂.热汗初级.mov', () => {
    const r = parseFilename('K2 HIIT 全身燃脂.热汗初级.mov')
    expect(r.level).toBe('K2')
    expect(r.type).toBe('HIIT')
    expect(r.bodyPart).toBe('全身')
    expect(r.name).toBe('HIIT 全身燃脂·热汗初级')
  })

  it('parses K2 HIIT 燃脂.腰腹初级.mov', () => {
    const r = parseFilename('K2 HIIT 燃脂.腰腹初级.mov')
    expect(r.level).toBe('K2')
    expect(r.type).toBe('HIIT')
    expect(r.bodyPart).toBe('腰腹')
    expect(r.name).toBe('HIIT 燃脂·腰腹初级')
  })

  it('parses K3 核心深度刺激.mov', () => {
    const r = parseFilename('K3 核心深度刺激.mov')
    expect(r.level).toBe('K3')
    expect(r.type).toBe('核心')
    expect(r.bodyPart).toBe('核心')
    expect(r.name).toBe('核心深度刺激')
  })

  it('parses K2 4分钟热力Tabata.mov', () => {
    const r = parseFilename('K2 4分钟热力Tabata.mov')
    expect(r.level).toBe('K2')
    expect(r.type).toBe('Tabata')
    expect(r.durationMin).toBe(4)
    expect(r.name).toBe('4分钟热力Tabata')
  })

  it('parses K3 12分钟热力Tabata.mov', () => {
    const r = parseFilename('K3 12分钟热力Tabata.mov')
    expect(r.level).toBe('K3')
    expect(r.type).toBe('Tabata')
    expect(r.durationMin).toBe(12)
  })

  it('parses K1 全身拉伸.mov', () => {
    const r = parseFilename('K1 全身拉伸.mov')
    expect(r.level).toBe('K1')
    expect(r.type).toBe('拉伸')
    expect(r.bodyPart).toBe('全身')
    expect(r.name).toBe('全身拉伸')
  })

  it('preserves original fileName', () => {
    const r = parseFilename('K2 HIIT 全身燃脂.热汗初级.mov')
    expect(r.fileName).toBe('K2 HIIT 全身燃脂.热汗初级.mov')
  })

  it('defaults to K1 / 其他 / 全身 when no keywords', () => {
    const r = parseFilename('无标识课程.mov')
    expect(r.level).toBe('K1')
    expect(r.type).toBe('其他')
    expect(r.bodyPart).toBe('全身')
    expect(r.durationMin).toBe(20)
  })
})
