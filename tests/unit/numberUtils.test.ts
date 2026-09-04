import { describe, it, expect } from 'vitest'
import { formatCompactNumber } from '../../src/helpers/numberUtils'

describe('formatCompactNumber', () => {
  it('formats small numbers without suffixes', () => {
    expect(formatCompactNumber(0)).toBe('0')
    expect(formatCompactNumber(100)).toBe('100')
    expect(formatCompactNumber(999)).toBe('999')
  })

  it('formats thousands with K suffix', () => {
    expect(formatCompactNumber(1000)).toBe('1K')
    expect(formatCompactNumber(1200)).toBe('1.2K')
    expect(formatCompactNumber(1255)).toBe('1.2K')
    expect(formatCompactNumber(999000)).toBe('999K')
  })

  it('formats millions with M suffix matching user requirements', () => {
    expect(formatCompactNumber(1000000)).toBe('1M')
    expect(formatCompactNumber(1200000)).toBe('1.2M')
    expect(formatCompactNumber(1255000)).toBe('1.2M')
    expect(formatCompactNumber(1500000)).toBe('1.5M')
  })

  it('formats billions with B suffix', () => {
    expect(formatCompactNumber(1000000000)).toBe('1B')
    expect(formatCompactNumber(1200000000)).toBe('1.2B')
    expect(formatCompactNumber(2500000000)).toBe('2.5B')
  })

  it('handles null, undefined, or NaN safely', () => {
    expect(formatCompactNumber(null)).toBe('0')
    expect(formatCompactNumber(undefined)).toBe('0')
    expect(formatCompactNumber(NaN)).toBe('0')
  })
})
