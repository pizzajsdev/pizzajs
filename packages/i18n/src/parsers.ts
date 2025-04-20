import type { AppLangContext } from './types'

interface LanguagePreference {
  tag: string
  quality: number
}

function parseLanguageTag(tag: string): string {
  // Remove any whitespace and convert to lowercase
  tag = tag.trim().toLowerCase()

  // Extract just the language tag part before any quality value
  const parts = tag.split(';')
  return parts[0]
}

function parseQualityValue(tag: string): number {
  const qMatch = tag.match(/;q=([0-9]*\.?[0-9]+)/i)
  if (qMatch) {
    const q = parseFloat(qMatch[1])
    return q >= 0 && q <= 1 ? q : 0
  }
  return 1.0 // Default quality value per spec
}

/**
 * Parses the Accept-Language header and returns an array of language preferences
 * based on spec.
 * @see https://www.rfc-editor.org/rfc/rfc5646.txt
 * @example
 * // Accept-Language: en-US, en;q=0.9, fr;q=0.8
 * // Returns:
 * [
 *   { tag: 'en-US', quality: 1.0 },
 *   { tag: 'en', quality: 0.9 },
 *   { tag: 'fr', quality: 0.8 }
 * ]
 */
export function parseAcceptLangHeader(acceptLangHeaderValue: string): LanguagePreference[] {
  if (!acceptLangHeaderValue) {
    return []
  }

  return acceptLangHeaderValue
    .split(',')
    .map((lang) => ({
      tag: parseLanguageTag(lang),
      quality: parseQualityValue(lang),
    }))
    .filter((lang) => lang.tag && lang.quality > 0) // Filter out invalid tags
    .sort((a, b) => b.quality - a.quality) // Sort by quality in descending order
}

export function parsePreferredLang(acceptLangHeader: string, ctx: AppLangContext): string {
  const acceptLangs = parseAcceptLangHeader(acceptLangHeader)
  const supportedLangsAndLocales = Object.values(ctx.all).flatMap((lang) => [lang.locale, lang.id])

  // Try to find the first supported language from the sorted preferences
  for (const { tag } of acceptLangs) {
    // Handle basic language matching
    // This includes handling both exact matches and primary language subtag matches
    const exactMatch = supportedLangsAndLocales.find((lang) => lang.toLowerCase() === tag)
    if (exactMatch) {
      return exactMatch
    }

    // Try matching just the primary language subtag
    const primaryTag = tag.split('-')[0]
    const primaryMatch = supportedLangsAndLocales.find((lang) => lang.toLowerCase().split('-')[0] === primaryTag)
    if (primaryMatch) {
      return primaryMatch
    }
  }

  return ctx.default.id
}
