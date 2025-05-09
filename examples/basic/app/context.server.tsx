import type { HttpBindings } from '@hono/node-server'
import type { Context } from 'hono'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'

export const getLoadContext = async (ctx: Context<{ Bindings: HttpBindings }>) => {
  const req = ctx.req.raw
  const url = new URL(req.url)
  const cookie = req.headers.get('Cookie') ?? ''
  const userAgent = req.headers.get('User-Agent')

  return {
    url,
    userAgent,
    cookie,
    // other data, e.g.:
    // lang,
    // session
  }
}

export interface LoadContext extends Awaited<ReturnType<typeof getLoadContext>> {}
export type LoaderFunctionArgsWithContext = LoaderFunctionArgs<LoadContext>
export type ActionFunctionArgsWithContext = ActionFunctionArgs<LoadContext>
export type ServerFunctionArgsWithContext = LoaderFunctionArgsWithContext | ActionFunctionArgsWithContext

declare module 'react-router' {
  interface AppLoadContext extends LoadContext {}
}
