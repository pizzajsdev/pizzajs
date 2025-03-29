import { type Options, defineConfig } from 'tsup'

const config: Options = {
  entry: {
    index: './src/index.ts',
  },
  outDir: './dist',
  format: ['esm'],
  target: 'es2020',
  ignoreWatch: ['**/dist/**', '**/node_modules/**', '*.test.ts'],
  // clean: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  minify: false,
  skipNodeModulesBundle: true,
  external: ['node_modules'],
}

export default defineConfig([config])
