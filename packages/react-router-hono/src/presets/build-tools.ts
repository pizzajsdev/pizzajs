import esbuild from 'esbuild'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { exit } from 'node:process'
import type { ResolvedConfig } from 'vite'
import type { NodeVersion } from './types'

type PackageJson = {
  name: string
  type: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
}

type SsrExternal = ResolvedConfig['ssr']['external']

const getPackageDependencies = (dependencies: Record<string, string | undefined>, ssrExternal: SsrExternal) => {
  const ssrExternalFiltered = Array.isArray(ssrExternal)
    ? ssrExternal.filter(
        (id) =>
          ![
            'react-router',
            'react-router-dom',
            '@react-router/architect',
            '@react-router/cloudflare',
            '@react-router/dev',
            '@react-router/express',
            '@react-router/node',
            '@react-router/serve',
          ].includes(id),
      )
    : ssrExternal

  return Object.keys(dependencies)
    .filter((key) => {
      if (ssrExternalFiltered === undefined || ssrExternalFiltered === true) {
        return false
      }

      return ssrExternalFiltered.includes(key)
    })
    .reduce((obj: Record<string, string>, key) => {
      obj[key] = dependencies[key] ?? ''

      return obj
    }, {})
}

const writePackageJson = async (
  pkg: PackageJson,
  outputFile: string,
  dependencies: unknown,
  nodeVersion: NodeVersion,
) => {
  const distPkg = {
    name: pkg.name,
    type: pkg.type,
    scripts: {
      postinstall: pkg.scripts?.['postinstall'] ?? '',
    },
    dependencies: dependencies,
    engines: {
      node: `${nodeVersion}.x`,
    },
  }

  await writeFile(outputFile, JSON.stringify(distPkg, null, 2), 'utf8')
}

export const buildEntry = async (
  appPath: string,
  entryFile: string,
  buildPath: string,
  buildFile: string,
  buildDir: string,
  assetsDir: string,
  serverBundleId: string,
  packageFile: string,
  ssrExternal: string[] | true | undefined,
  nodeVersion: NodeVersion,
): Promise<string> => {
  console.log(`Bundle Server file for ${serverBundleId}...`)

  const pkg = JSON.parse(await readFile(packageFile, 'utf8')) as PackageJson
  const packageDependencies = getPackageDependencies({ ...pkg.dependencies }, ssrExternal)

  await writePackageJson(pkg, join(buildPath, 'package.json'), packageDependencies, nodeVersion)

  const bundleFile = join(buildPath, 'server.mjs')

  await esbuild
    .build({
      outfile: bundleFile,
      entryPoints: [join(appPath, entryFile)],
      alias: {
        'virtual:react-router/server-build': buildFile,
      },
      define: {
        'process.env.NODE_ENV': "'production'",
        'import.meta.env.PIZZAJS_BUILD_DIR': `'${buildDir}'`,
        'import.meta.env.PIZZAJS_ASSETS_DIR': `'${assetsDir}'`,
      },
      banner: { js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);" },
      platform: 'node',
      target: `node${nodeVersion}`,
      format: 'esm',
      external: ['vite', ...Object.keys(packageDependencies)],
      bundle: true,
      charset: 'utf8',
      legalComments: 'none',
      minify: false,
    })
    .catch((error: unknown) => {
      console.error(error)
      exit(1)
    })

  return bundleFile
}
