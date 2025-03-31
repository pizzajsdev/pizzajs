import { getRequestListener } from '@hono/node-server'
import type { Config as ReactRouterConfig } from '@react-router/dev/config'
import { minimatch } from 'minimatch'
import { existsSync, statSync } from 'node:fs'
import type http from 'node:http'
import { join, relative } from 'node:path'
import type { Connect, UserConfig, ViteDevServer, Plugin as VitePlugin } from 'vite'

type ReactRouterHonoServerOptions = {
  entryFile?: string
  exclude?: (string | RegExp)[]
}

type ReactRouterPluginContext = {
  reactRouterConfig: Required<ReactRouterConfig>
  rootDirectory: string
  entryClientFilePath: string
  entryServerFilePath: string
  isSsrBuild: true
}

type Fetch = (
  request: Request,
  env: { incoming: http.IncomingMessage; outgoing: http.ServerResponse },
) => Promise<Response>

type LoadModule = (server: ViteDevServer, entry: string) => Promise<{ fetch: Fetch }>

const resolveReactRouterPluginConfig = (config: UserConfig, options: ReactRouterHonoServerOptions | undefined) => {
  if (!('__reactRouterPluginContext' in config)) {
    return null
  }

  const reactRouterConfig = config.__reactRouterPluginContext as ReactRouterPluginContext

  const appDir = relative(reactRouterConfig.rootDirectory, reactRouterConfig.reactRouterConfig.appDirectory)

  return {
    appDir: appDir,
    entryFile: join(appDir, options?.entryFile ?? 'server.ts'),
    buildDir: relative(reactRouterConfig.rootDirectory, reactRouterConfig.reactRouterConfig.buildDirectory),
    assetsDir: config.build?.assetsDir || 'assets',
  }
}

type ReactRouterPluginConfig = ReturnType<typeof resolveReactRouterPluginConfig>

// noinspection JSUnusedGlobalSymbols
export const reactRouterHonoDevServer = (options?: ReactRouterHonoServerOptions): VitePlugin => {
  let publicDirPath = ''
  let reactRouterConfig: ReactRouterPluginConfig

  return {
    name: '@itsjavi/react-router-hono-server',
    enforce: 'post',
    config(config) {
      reactRouterConfig = resolveReactRouterPluginConfig(config, options)

      if (!reactRouterConfig) {
        return
      }

      return {
        define: {
          'import.meta.env.PIZZAJS_BUILD_DIR': JSON.stringify(reactRouterConfig.buildDir),
          'import.meta.env.PIZZAJS_ASSETS_DIR': JSON.stringify(reactRouterConfig.assetsDir),
        },
        ssr: {
          noExternal: ['@pizzajsdev/react-router-hono'],
        },
      } satisfies UserConfig
    },
    configResolved(config) {
      publicDirPath = config.publicDir
    },
    async configureServer(server) {
      if (!reactRouterConfig) {
        return
      }

      const mergedExclude = [
        new RegExp(
          `^(?=\\/${reactRouterConfig.appDir.replace(/^\/+|\/+$/g, '').replaceAll('/', '\\/')}\\/)((?!.*\\.data(\\?|$)).*\\..*(\\?.*)?$)`,
        ),
        // tells the server to not handle these imports as public assets
        /[\?\&]import(\?.*)?$/,
        /[\?\&]react(\?.*)?$/,
        /^\/@.+$/,
        /^\/node_modules\/.*/,
        `/${reactRouterConfig.appDir}/**/.*/**`,
        ...(options?.exclude ?? []),
      ]

      const createMiddleware =
        async (server: ViteDevServer): Promise<Connect.HandleFunction> =>
        async (req: http.IncomingMessage, res: http.ServerResponse, next: Connect.NextFunction): Promise<void> => {
          if (req.url) {
            const filePath = join(publicDirPath, req.url)

            try {
              if (existsSync(filePath) && statSync(filePath).isFile()) {
                return next()
              }
            } catch {
              // do nothing
            }
          }

          for (const pattern of mergedExclude) {
            if (req.url) {
              if (pattern instanceof RegExp) {
                if (pattern.test(req.url)) {
                  return next()
                }
              } else if (minimatch(req.url?.toString(), pattern)) {
                return next()
              }
            }
          }

          const loadModule: LoadModule = async (server, entry) => {
            const appModule = await server.ssrLoadModule(entry)
            const app = appModule['default'] as { fetch: Fetch }
            if (!app) {
              throw new Error(`Failed to find default export from ${entry}`)
            }

            return app
          }

          let app: { fetch: Fetch }

          try {
            app = await loadModule(server, join(reactRouterConfig!.entryFile))
          } catch (e) {
            return next(e)
          }

          await getRequestListener(
            async (request) => {
              const response = await app.fetch(request, { incoming: req, outgoing: res })

              if (!(response instanceof Response)) {
                throw response
              }

              return response
            },
            {
              overrideGlobalObjects: false,
              errorHandler: (e) => {
                let err: Error
                if (e instanceof Error) {
                  err = e
                  server.ssrFixStacktrace(err)
                } else if (typeof e === 'string') {
                  err = new Error(`The response is not an instance of "Response", but: ${e}`)
                } else {
                  err = new Error(`Unknown error: ${e}`)
                }

                next(err)
              },
            },
          )(req, res)
        }

      server.middlewares.use(await createMiddleware(server))
    },
  }
}
