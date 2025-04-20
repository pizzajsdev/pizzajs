# PizzaJS i18n

Internationalization utilities for React apps.

## Setup

```bash
echo "@pizzajsdev:registry=https://npm.pkg.github.com" >> .npmrc
pnpm add @pizzajsdev/i18n
```

## Translations

This library is not opinionated about how you store your translations, but the library expects the translations to be
all loaded following this structure:

```json
{
  "en": {
    "greeting": "Hello, world!",
    "nested": {
      "subtitle": "This is a subtitle"
    }
  },
  "es": {
    "greeting": "Hola, mundo!",
    "nested": {
      "subtitle": "Este es un subtítulo"
    }
  }
}
```

Once you've loaded all the translations, you can build a flattened object with the following function:

```ts
import { buildFlattenedTranslations } from '@pizzajsdev/i18n/utils'

const allTranslationsByLang = {
  /* ... */
} // same structure as in the example above
const langId = 'de'
const fallbackLangId = 'en'
const flattenedTranslations_DE = buildFlattenedTranslations(langId, fallbackLangId, allTranslationsByLang)
```

If you want to generate a TypeScript type definition for the flattened translation keys, you can use the following
function:

```ts
import { generateTranslationTypesCode } from '@pizzajsdev/i18n/utils'

const tsCode = generateTranslationTypesCode(defaultLangId, allTranslationsByLang)
// Save it in your project, as `global.d.ts`
fs.writeFileSync('global.d.ts', tsCode)
```

## Integrations

### React Router 7+

This library does not depend on React Router, but it can be easily integrated with it.

Ideally you would inject the resolved language in the `AppLoadContext`, using a custom React Router server implementing
a `getLoadContext` function. This will make the resolved language automatically available to all the loaders and actions
in your app.

If you use the `@pizzajsdev/react-router-hono` package, it is very easy to implement it:

`app/context.server.ts`:

```ts
import type { HttpBindings } from '@hono/node-server'
import type { Context } from 'hono'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { resolveLangFromRequest } from '@pizzajsdev/i18n/resolver'
import { createAppLangHashMap } from '@pizzajsdev/i18n/utils'

const supportedLangs = [
  { id: 'en', locale: 'en-US', isDefault: true },
  { id: 'es', locale: 'es-ES' },
]
const defaultLang = supportedLangs[0]
const supportedLangsHashMap = createAppLangHashMap(supportedLangs)
const langConfig = {
  all: supportedLangsHashMap,
  default: defaultLang,
}

export const getLoadContext = async (ctx: Context<{ Bindings: HttpBindings }>) => {
  return {
    langConfig,
    lang: resolveLangFromRequest(ctx.req.raw, langConfig),
    // other data, e.g.:
    // url: new URL(ctx.req.raw.url),
    // session: loadSession(ctx.req.raw.headers.get('Cookie')),
  }
}

export interface LoadContext extends Awaited<ReturnType<typeof getLoadContext>> {}

declare module 'react-router' {
  interface AppLoadContext extends LoadContext {}
}
```

To pass it to the client, you need to wrap your app with the `I18nProvider` component:

`app/root.tsx`:

```tsx
import type { Route } from './+types/root'
import { I18nProvider } from '@pizzajsdev/i18n/react'
import { getAbsUrlUtil } from '@pizzajsdev/utils/urls'
// ... other react-router imports

export async function loader({ context }: Route.LoaderArgs) {
  const { lang, langConfig } = context

  if (lang.shouldRedirect) {
    // Optional, if you want to force the language in the URL depending on the preferred language.
    return Response.redirect(lang.canonicalUrl.toString())
  }

  const langId = lang.resolved.id
  const fallbackLangId = langConfig.default.id

  // Load translations for the current language.
  // For optimal performance, you should cache them instead of flattening them on every request.
  const translations = buildFlattenedTranslations(langId, fallbackLangId, allTranslationsByLang)

  // WARNING: the returned data is sent to the client on hydration! Never expose sensitive data in loaders.
  return {
    lang,
    langConfig,
    warnOnMissingTranslations: process.env.NODE_ENV === 'development',
    translations,
    baseUrl: getBaseUrl(), // Optional, if you want to build canonical links. It assumes you have a `getBaseUrl` function.
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>('root')
  const location = useLocation()
  const cleanAbsUrl = getAbsUrlUtil(location.pathname, loaderData?.baseUrl)
  const canonicalLinks = buildCanonicalLinks(cleanAbsUrl, location.search)

  return (
    <html lang={loaderData?.lang.resolved.locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {canonicalLinks.map((linkProps) => (
          <link key={linkProps.href} {...linkProps} />
        ))}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <I18nProvider
      lang={loaderData.lang.resolved}
      defaultLangId={loaderData.langConfig.default.id}
      translations={loaderData.translations}
      warnIfMissing={loaderData.warnOnMissingTranslations}
    >
      <Outlet />
    </I18nProvider>
  )
}
```

You can now use the `useI18n` hook inside your components to get the current language and the translation function `t`:

```tsx
import { useI18n } from '@pizzajsdev/i18n/react'

export function Greeting() {
  const { t, lang } = useI18n()

  return (
    <div>
      <h1>{t('greeting')}</h1>
      <p>{t('nested.subtitle')}</p>
      <p>Current language: {lang.id}</p>
    </div>
  )
}
```
