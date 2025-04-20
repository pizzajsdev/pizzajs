import { createContext, useContext } from 'react'
import type { AppLang } from './types'

export type I18nContextValue = {
  lang: AppLang
  defaultLangId: string
  translations: Record<AppTranslationKey, string>
  warnIfMissing: boolean
}

type I18nProviderProps = I18nContextValue & {
  children: React.ReactNode
}

type I18nProviderActions<TranslationKey extends string = string> = {
  /**
   * Translates a key to a string
   * @param key - The key to translate
   * @returns The translated string or the key if it doesn't exist
   */
  t: (key: TranslationKey) => string | null
  /**
   * Builds a URL path with the current language, if it's not the default language
   * @param path - The path to build the URL for
   * @param query - The query parameters to add to the URL
   * @returns The built URL
   */
  href: (path: string, query?: Record<string, string>) => string
}

type I18nProviderValue = I18nContextValue & I18nProviderActions

const I18nContext = createContext<I18nProviderValue | undefined>(undefined)

export function createTranslatorFn(
  langId: string,
  translations: Record<AppTranslationKey, string>,
  warnIfMissing = false,
) {
  return (key: AppTranslationKey) => {
    const translation = translations[key]
    if (warnIfMissing && translation === undefined) {
      console.warn(`WARN: Translation key "${key}" not found in lang "${langId}"`)
    }
    return translation ?? key
  }
}

export function I18nProvider({
  children,
  lang,
  defaultLangId,
  translations,
  warnIfMissing = false,
}: I18nProviderProps) {
  const translateFn = createTranslatorFn(lang.id, translations, warnIfMissing)
  const hrefFn: I18nProviderActions['href'] = (path, query) => {
    const q = new URLSearchParams(query)
    if (lang.id !== defaultLangId) {
      q.set('lang', lang.id)
    }
    return path + (q.size > 0 ? `?${q.toString()}` : '')
  }
  return (
    <I18nContext.Provider value={{ lang, defaultLangId, translations, warnIfMissing, t: translateFn, href: hrefFn }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nProviderValue {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useTranslations must be used within a I18nProvider')
  }
  return context
}
