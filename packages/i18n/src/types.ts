import type { DeepKeyValueObj } from '@pizzajsdev/utils/serialization'

export type AppLang = {
  /**
   * Language code without locale, e.g. "en", "es", "fr", etc.
   */
  id: string
  /**
   * Locale (ISO 639-1), e.g. "en-US", "es-ES", "fr-FR", etc.
   */
  locale: string
  /**
   * Whether this is the default language of the app.
   */
  isDefault?: boolean
}

export type AppLangHashMap = Record<string, AppLang>

export type AppLangContext = {
  all: AppLangHashMap
  default: AppLang
  userSetting?: AppLang
}

export type AppLangResolution = {
  resolved: AppLang
  fromUrl: string | null
  fromHeader: string | null
}

/**
 * A flattened translation document, keyed by translation key.
 */
export type AppI18nTexts = Record<AppTranslationKey, string>

/**
 * All translations in a single object, keyed by language ID.
 * They can be a deep object, or a flat object.
 */
export type AppRawTranslationsByLang = Record<string, DeepKeyValueObj>
