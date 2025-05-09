# react-router-hono

React Router v7+ adapter for Hono, compatible with Node and Vercel servers.

## Setup

```bash
echo "@pizzajsdev:registry=https://npm.pkg.github.com" >> .npmrc
pnpm add @pizzajsdev/react-router-hono hono @hono/node-server
```

## Usage

### Vercel

`react-router.config.ts`:

```ts
import type { Config } from '@react-router/dev/config'
import { createAutomaticPreset } from '@pizzajsdev/react-router-hono/presets'

export default {
  presets: [createAutomaticPreset()],
} satisfies Config
```

`app/entry.server.tsx`:

```ts
import { handleRequest } from '@pizzajsdev/react-router-hono/server-entry'

export default handleRequest
```

`app/context.server.ts`:

```ts
import type { HttpBindings } from '@hono/node-server'
import type { Context } from 'hono'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'

export const getLoadContext = async (ctx: Context<{ Bindings: HttpBindings }>) => {
  const req = ctx.req.raw
  const url = new URL(req.url)
  const cookie = req.headers.get('Cookie') ?? ''
  const userAgent = req.headers.get('User-Agent')

  return {
    // Example data:
    url,
    userAgent,
    cookie,
    // lang,
    // session,
    // etc.
  }
}

export interface LoadContext extends Awaited<ReturnType<typeof getLoadContext>> {}
export type LoaderFunctionArgsWithContext = LoaderFunctionArgs<LoadContext>
export type ActionFunctionArgsWithContext = ActionFunctionArgs<LoadContext>
export type ServerFunctionArgsWithContext = LoaderFunctionArgsWithContext | ActionFunctionArgsWithContext

declare module 'react-router' {
  interface AppLoadContext extends LoadContext {}
}
```

`app/server.vercel.ts`:

```ts
import { createHonoVercelServer } from '@pizzajsdev/react-router-hono/presets/vercel/server'
import { getLoadContext } from './context.server'

export default await createHonoVercelServer({
  getLoadContext: getLoadContext,
})
```

`app/server.node.ts`:

```ts
import { createHonoNodeServer } from '@pizzajsdev/react-router-hono/presets/node/server'
import { getLoadContext } from './context.server'

export default await createHonoNodeServer({
  getLoadContext: getLoadContext,
})
```

`vite.config.ts`:

```ts
import { reactRouterHonoDevServer } from '@pizzajsdev/react-router-hono/vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tailwindcss(),
    // Add the Hono dev server plugin:
    reactRouterHonoDevServer({
      entryFile: 'server.node.ts',
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
})
```

## Credits

Partially ported from the following projects:

- https://github.com/huijiewei/resolid-react-router-hono
- https://github.com/huijiewei/react-router-hono-vercel-template

Other references:

- https://vercel.com/docs/frameworks/react-router
