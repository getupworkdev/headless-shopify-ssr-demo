import { describe, expect, it } from 'vitest'
import { validateQuote } from '../src/lib/quote'

const form = (o: Record<string, string>) => {
  const f = new FormData()
  Object.entries(o).forEach(([k, v]) => f.set(k, v))
  return f
}

describe('quote form validation', () => {
  it('accepts a complete request', () => {
    expect(validateQuote(form({ name: 'Anna Berg', contact: 'anna@example.se', postcode: '114 35', property: 'House' })).errors).toEqual({})
  })
  it('flags every missing or malformed field', () => {
    expect(Object.keys(validateQuote(form({ name: 'A', contact: 'nope', postcode: '1', property: 'Castle' })).errors)).toEqual([
      'name',
      'contact',
      'postcode',
      'property',
    ])
  })
})
