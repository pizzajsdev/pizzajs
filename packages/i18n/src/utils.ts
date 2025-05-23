import { flattenObject } from '@pizzajsdev/utils/serialization'
import type { AppI18nTexts, AppLang, AppLangHashMap, AppRawTranslationsByLang } from './types'

type CanonicalLinkAttributes = {
  rel: string
  href: string
  hrefLang: string
}

/**
 * Builds multilingual canonical links for the current pathname and search params.
 * It follows the Google Search recommendation of 2011 of using "alternate" links
 * instead of "canonical" links.
 *
 * @param cleanUrl - The clean URL to build the canonical links for, without the search params.
 * @param supportedLangs - The supported languages in your app.
 * @param defaultLang - The default language in your app.
 * @param search - Optional. The search params that will be added to the canonical links.
 *
 * @see https://developers.google.com/search/blog/2011/12/new-markup-for-multilingual-content
 */
export function buildCanonicalLinks(
  cleanUrl: string,
  supportedLangs: string[],
  defaultLang: string,
  search?: string,
): Array<CanonicalLinkAttributes> {
  const q = new URLSearchParams(search)
  const canonicalLinks: Array<CanonicalLinkAttributes> = supportedLangs.map((lang) => {
    if (lang === defaultLang) {
      q.delete('lang')
    } else {
      q.set('lang', lang)
    }
    const query = q.size > 0 ? `?${q.toString()}` : ''
    const href = `${cleanUrl}${query}`

    return { rel: 'alternate', href, hrefLang: lang }
  })
  return canonicalLinks
}

export function createAppLangHashMap(supportedLangs: Array<AppLang>): AppLangHashMap {
  return Object.fromEntries(
    Object.values(supportedLangs).flatMap((lang) => [
      [lang.id, lang],
      [lang.locale.replace('-', '_').toLowerCase(), lang],
      [lang.locale.toLowerCase(), lang],
    ]),
  )
}

/**
 * Builds a flattened translations document for a given language.
 *
 * @param langId - The language ID of the language to build the flattened translations for.
 * @param fallbackLangId - The language ID of the fallback language. All translations will be merged with the fallback
 * language translations for any missing keys.
 * @param rawTranslations - All the translations, unflattened and by language ID.
 * @returns The flattened translations document.
 */
export function buildFlattenedTranslations(
  langId: string,
  fallbackLangId: string,
  rawTranslations: AppRawTranslationsByLang,
): AppI18nTexts {
  const translations = rawTranslations[langId] ?? {}
  const fallbackTranslations =
    langId === fallbackLangId ? {} : buildFlattenedTranslations(fallbackLangId, fallbackLangId, rawTranslations)

  const doc: AppI18nTexts = Object.assign({}, fallbackTranslations, flattenObject(translations))

  return doc
}

/**
 * Generates a TypeScript type definition for the translation keys, to be stored in a global.d.ts file in your project.
 *
 * @param defaultLangId - The language ID of the default language.
 * @param rawTranslations - The raw translations.
 * @returns The TypeScript type definition for the translation keys.
 */
export function generateTranslationTypesCode(defaultLangId: string, rawTranslations: AppRawTranslationsByLang) {
  const texts = buildFlattenedTranslations(defaultLangId, defaultLangId, rawTranslations)
  const translationKeys = Object.keys(texts)
  const langArrayCode = JSON.stringify(translationKeys).replace(/,/gm, ', ').replace(/[\"]/gm, "'")
  const tsCode = `
// This file is auto-generated by @pizzajsdev/i18n
const translationKeys = ${langArrayCode} as const
type TranslationKey = (typeof translationKeys)[number]
  `
  return tsCode.trim() + '\n'
}
