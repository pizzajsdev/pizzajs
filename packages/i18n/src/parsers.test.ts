import { describe, expect, it } from 'vitest'
import { parsePreferredLang } from './parsers'
import { createAppLangHashMap } from './utils'

describe('parsePreferredLang', () => {
  const supportedLangs = createAppLangHashMap([
    { id: 'en', locale: 'en-US', isDefault: true },
    { id: 'es', locale: 'es-ES' },
    { id: 'fr', locale: 'fr' },
    { id: 'de', locale: 'de-DE' },
    { id: 'ja', locale: 'ja' },
  ])
  const fallbackLang = { id: 'de', locale: 'de-DE', isDefault: true }
  const ctx = { all: supportedLangs, default: fallbackLang }

  it('should return exact match when available', () => {
    const header = 'es-ES,en;q=0.9'
    expect(parsePreferredLang(header, ctx)).toBe('es-ES')
  })

  it('should handle quality values correctly', () => {
    const header = 'fr;q=0.8,es-ES;q=0.9,en-US;q=0.7'
    expect(parsePreferredLang(header, ctx)).toBe('es-ES')
  })

  it('should match primary language tag when exact match not found', () => {
    const header = 'fr-FR,en-GB;q=0.9'
    expect(parsePreferredLang(header, ctx)).toBe('fr')
  })

  it('should be case insensitive', () => {
    const header = 'ES-es,EN-us;q=0.9'
    expect(parsePreferredLang(header, ctx)).toBe('es-ES')
  })

  it('should return fallback language when no matches found', () => {
    const header = 'it-IT,pt-BR;q=0.9'
    expect(parsePreferredLang(header, ctx)).toBe(fallbackLang.id)
  })

  it('should handle empty Accept-Language header', () => {
    expect(parsePreferredLang('', ctx)).toBe(fallbackLang.id)
  })

  it('should handle malformed Accept-Language header', () => {
    const header = 'invalid;;q=language,,en-US;q=0.8'
    expect(parsePreferredLang(header, ctx)).toBe('en-US')
  })

  it('should handle multiple matching languages with different qualities', () => {
    const header = 'ja;q=0.5,en-US;q=0.8,fr;q=0.9'
    expect(parsePreferredLang(header, ctx)).toBe('fr')
  })

  it('should handle language tags with extensions and variants', () => {
    const header = 'en-US-x-custom,fr-FR-1996;q=0.9'
    expect(parsePreferredLang(header, ctx)).toBe('en-US')
  })

  it('should handle empty supported languages array', () => {
    const header = 'en-US,fr;q=0.9'
    expect(parsePreferredLang(header, { all: {}, default: fallbackLang })).toBe(fallbackLang.id)
  })
})
