import { parsePreferredLang } from './parsers'
import type { AppLang, AppLangContext, AppLangHashMap, AppLangResolution } from './types'

/**
 * Returns a supported language from a language code.
 * @param langCode It can be a language code, a language code in 2 characters, or a language code in 3 characters.
 * @returns
 */
export function matchLang(
  langCodeOrLocale: string | undefined | null,
  supportedLangsHashMap: AppLangHashMap,
): AppLang | null {
  if (!langCodeOrLocale) {
    return null
  }
  const lang = langCodeOrLocale.trim().toLowerCase()
  const lang2char = lang.slice(0, 2)

  return supportedLangsHashMap[lang] ?? supportedLangsHashMap[lang2char] ?? null
}

/**
 * Returns a supported language from the user's settings, the URL query string, or the Accept-Language header,
 * in that order of priority.
 */
export function getPreferredLanguage(
  langFromUrl: string | null,
  langsFromHeader: string | null,
  ctx: AppLangContext,
): AppLang {
  if (langFromUrl) {
    const lang = matchLang(langFromUrl, ctx.all)
    if (lang) {
      return lang
    }
  }

  if (ctx.userSetting) {
    const lang = matchLang(ctx.userSetting.id, ctx.all)
    if (lang) {
      return lang
    }
  }

  if (langsFromHeader) {
    const preferredLang = parsePreferredLang(langsFromHeader, ctx)
    return matchLang(preferredLang, ctx.all) ?? ctx.default
  }

  return ctx.default
}

export function resolveLangFromRequest(
  req: Request,
  ctx: AppLangContext,
): {
  lang: AppLangResolution
  canonicalUrl: URL
  shouldRedirect: boolean
} {
  const url = new URL(req.url)
  const langFromUrl = url.searchParams.get('hl') || url.searchParams.get('lang')
  const langsFromHeader = req.headers.get('accept-language')

  const lang: AppLangResolution = {
    resolved: getPreferredLanguage(langFromUrl, langsFromHeader, ctx),
    fromUrl: langFromUrl,
    fromHeader: langsFromHeader,
  }

  lang.resolved = {
    ...lang.resolved,
    isDefault: lang.resolved.id === ctx.default.id,
  }

  // Redirection rules:
  const urlLangIsMissingNotDefault = lang.resolved.id !== ctx.default.id && !lang.fromUrl
  const urlLangIsWrong = lang.fromUrl !== null && lang.resolved.id !== lang.fromUrl
  const hasWrongUrlParam = url.searchParams.has('hl')
  const isReadOnlyRequest = req.method === 'GET' || req.method === 'HEAD'
  const isApiRequest = url.pathname.startsWith('/api/')
  const hasDefaultLangInUrl = lang.resolved.id === ctx.default.id && lang.fromUrl === null
  const isDataUrl = url.pathname.endsWith('.data')

  if (urlLangIsMissingNotDefault || urlLangIsWrong || hasWrongUrlParam || hasDefaultLangInUrl) {
    url.searchParams.delete('hl')
    if (lang.resolved.id === ctx.default.id) {
      url.searchParams.delete('lang')
    } else {
      url.searchParams.set('lang', lang.resolved.id)
    }
    return {
      lang,
      canonicalUrl: url,
      shouldRedirect: isReadOnlyRequest && !hasDefaultLangInUrl && !isApiRequest && !isDataUrl,
    }
  }

  return {
    lang,
    canonicalUrl: url,
    shouldRedirect: false,
  }
}

export function resolveLangFromUrl(url: string | URL, ctx: AppLangContext): AppLang {
  const urlObj = url instanceof URL ? url : new URL(url)
  const lang = urlObj.searchParams.get('lang') ?? urlObj.searchParams.get('hl')
  if (!lang) {
    return ctx.default
  }

  const resolvedLang = matchLang(lang, ctx.all)
  if (!resolvedLang) {
    return ctx.default
  }

  return resolvedLang
}
