import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream, type RenderToPipeableStreamOptions } from 'react-dom/server'
import { type EntryContext, ServerRouter } from 'react-router'

// Taken from: https://github.com/huijiewei/react-router-hono-vercel-template/blob/main/app/entry.server.tsx

// noinspection JSUnusedGlobalSymbols
const streamTimeout = 10_000

// noinspection JSUnusedGlobalSymbols
export function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  const ready: keyof RenderToPipeableStreamOptions = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady'

  return new Promise((resolve, reject) => {
    let shellRendered = false

    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      [ready]() {
        shellRendered = true
        const body = new PassThrough()
        const stream = createReadableStreamFromReadable(body)

        responseHeaders.set('Content-Type', 'text/html')

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        )

        pipe(body)
      },
      onShellError(error: unknown) {
        reject(error)
      },
      onError(error: unknown) {
        // biome-ignore lint/style/noParameterAssign: <explanation>
        responseStatusCode = 500

        if (shellRendered) {
          console.error(error)
        }
      },
    })

    setTimeout(abort, streamTimeout + 1000)
  })
}
