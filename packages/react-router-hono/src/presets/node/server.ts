import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Env, MiddlewareHandler } from 'hono'
import { logger } from 'hono/logger'
import type { BlankEnv } from 'hono/types'
import type { AddressInfo } from 'node:net'
import { networkInterfaces } from 'node:os'
import { createHonoServer, type HonoServerOptions } from '../hono-server'

export type { HonoServerOptions }

export type HonoNodeServerOptions<E extends Env = BlankEnv> = HonoServerOptions<E> & {
  port?: number
  defaultLogger?: boolean
  listeningListener?: (info: AddressInfo) => void
}

// noinspection JSUnusedGlobalSymbols
export const cache =
  (seconds: number, immutable = false): MiddlewareHandler =>
  async (c, next) => {
    if (!c.req.path.match(/\.[a-zA-Z0-9]+$/) || c.req.path.endsWith('.data')) {
      return next()
    }

    await next()

    if (!c.res.ok) {
      return
    }

    c.res.headers.set('cache-control', `public, max-age=${seconds}${immutable ? ', immutable' : ''}`)
  }

// noinspection JSUnusedGlobalSymbols
export const createHonoNodeServer = async <E extends Env = BlankEnv>(options: HonoNodeServerOptions<E> = {}) => {
  const mode = process.env['NODE_ENV'] == 'test' ? 'development' : process.env['NODE_ENV']
  const isProduction = mode == 'production'

  const mergedOptions: HonoNodeServerOptions<E> = {
    ...{
      port: Number(process.env['PORT']) || 3000,
      listeningListener: (info) => {
        console.log(`🚀 Server started on port ${info.port}`)

        const address = Object.values(networkInterfaces())
          .flat()
          .find((ip) => String(ip?.family).includes('4') && !ip?.internal)?.address

        const servePath = process.env['SERVE_PATH'] ? process.env['SERVE_PATH'] : ''

        console.log(
          `[itsjavi-hono-server] http://localhost:${info.port}${servePath}${address && ` (http://${address}:${info.port})`}`,
        )
      },
    },
    ...options,
    defaultLogger: options.defaultLogger ?? !isProduction,
  }

  const importMeta: any = typeof import.meta !== 'undefined' ? import.meta : {}
  const metaEnv: Record<string, string | undefined> = importMeta?.env ?? {}
  const server = await createHonoServer(mode, {
    configure: async (server) => {
      if (isProduction) {
        const clientBuildPath = `${metaEnv['PIZZAJS_BUILD_DIR']}/client`

        server.use(
          `/${metaEnv['PIZZAJS_ASSETS_DIR']}/*`,
          cache(60 * 60 * 24 * 365, true),
          serveStatic({ root: clientBuildPath }),
        )
        server.use('*', cache(60 * 60), serveStatic({ root: clientBuildPath }))
      } else {
        server.use('*', cache(60 * 60), serveStatic({ root: './public' }))
      }

      if (mergedOptions.defaultLogger) {
        server.use('*', logger())
      }

      await mergedOptions.configure?.(server)
    },

    getLoadContext: mergedOptions.getLoadContext,
    honoOptions: mergedOptions.honoOptions,
  })

  if (isProduction) {
    serve(
      {
        ...server,
        port: mergedOptions.port,
      },
      mergedOptions.listeningListener,
    )
  }

  return server
}
