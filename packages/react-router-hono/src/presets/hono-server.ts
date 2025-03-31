import { type Context, type Env, Hono } from 'hono'
import type { HonoOptions } from 'hono/hono-base'
import type { BlankEnv } from 'hono/types'
import { type AppLoadContext, createRequestHandler, type ServerBuild } from 'react-router'

export type HonoServerOptions<E extends Env = BlankEnv> = {
  configure?: <E extends Env = BlankEnv>(app: Hono<E>) => Promise<void> | void
  getLoadContext?: (
    c: Context,
    options: {
      build: ServerBuild
      mode?: string
    },
  ) => Promise<AppLoadContext> | AppLoadContext
  honoOptions?: HonoOptions<E>
}

export const createHonoServer = async <E extends Env = BlankEnv>(
  mode: string | undefined,
  options: HonoServerOptions<E> = {},
) => {
  const server = new Hono<E>(options.honoOptions)

  if (options.configure) {
    await options.configure(server)
  }

  server.use('*', async (c) => {
    const build: ServerBuild = (await import(
      // Virtual module provided by React Router at build time
      // @ts-ignore
      'virtual:react-router/server-build'
    )) as ServerBuild

    return (async (c) => {
      const requestHandler = createRequestHandler(build, mode)
      const loadContext = options.getLoadContext?.(c, { build, mode })
      return requestHandler(c.req.raw, loadContext instanceof Promise ? await loadContext : loadContext)
    })(c)
  })

  return server
}
