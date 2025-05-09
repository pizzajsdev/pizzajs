import { type Options, defineConfig } from 'tsup'

const config: Options = {
  entry: ['./src/**/!(*.test).ts', './src/**/!(*.test).tsx'],
  outDir: './dist',
  format: ['esm'],
  target: 'es2020',
  ignoreWatch: ['**/dist/**', '**/node_modules/**', '*.test.ts'],
  clean: true,
  // minify: false,
  bundle: false,
  dts: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  skipNodeModulesBundle: true,
  external: ['node_modules'],
}

export default defineConfig([config])
