import { nodePreset } from './node/preset'
import type { NodeVersion } from './types'
import { vercelPreset } from './vercel/preset'

/**
 * Automatically creates a React Router preset based on the environment. If it detects that it is running in Vercel,
 * it will use the Vercel preset, otherwise it will use the Node preset.
 *
 * @param vercelRegions - The regions to deploy the Vercel functions to. Deploying Serverless Functions to more
 * than 3 regions is restricted to the Enterprise plan. Default is ['fra1'] (Frankfurt).
 * @param nodeVersion - The Node.js version to use. Default is 22.
 * @param entryFiles - The entry files for the Node and Vercel servers, relative to the app directory.
 *  Default is `{ node: 'server.node.ts', vercel: 'server.vercel.ts' }`.
 * @returns A React Router preset.
 *
 * @example
 * ```ts
 * // react-router.config.ts
 * import type { Config } from '@react-router/dev/config'
 * import { createAutomaticPreset } from '@pizzajsdev/react-router-hono/presets'
 *
 * export default {
 *   presets: [createAutomaticPreset()],
 * } satisfies Config
 * ```
 */
export function createAutomaticPreset(
  vercelRegions: string[] = ['fra1'],
  nodeVersion: NodeVersion = 22,
  entryFiles: {
    node: string
    vercel: string
  } = {
    node: 'server.node.ts',
    vercel: 'server.vercel.ts',
  },
) {
  return [
    process.env['VERCEL'] == '1'
      ? vercelPreset({
          regions: vercelRegions,
          entryFile: entryFiles.vercel,
          nodeVersion,
        })
      : nodePreset({
          entryFile: entryFiles.node,
          nodeVersion,
        }),
  ]
}
