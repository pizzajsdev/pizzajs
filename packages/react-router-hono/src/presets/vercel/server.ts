import { handle } from '@hono/node-server/vercel'
import type { Env } from 'hono'
import type { BlankEnv } from 'hono/types'
import { createHonoServer, type HonoServerOptions } from '../hono-server'

export type { HonoServerOptions }

export type HonoVercelServerOptions<E extends Env = BlankEnv> = HonoServerOptions<E>

// noinspection JSUnusedGlobalSymbols
export const createHonoVercelServer = async <E extends Env = BlankEnv>(options: HonoVercelServerOptions<E> = {}) => {
  const mode = process.env['NODE_ENV'] == 'test' ? 'development' : process.env['NODE_ENV']

  const server = await createHonoServer(mode, {
    configure: options.configure,
    getLoadContext: options.getLoadContext,
    honoOptions: options.honoOptions,
  })

  return handle(server)
}
