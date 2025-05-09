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
  plugins: [
    {
      // https://github.com/egoist/tsup/issues/953
      // ensuring that all local imports in `.js` files import from `.js` files.
      name: 'fix-esm-js-imports',
      renderChunk(code) {
        if (this.format === 'esm') {
          const regexEsm = /from(?<space>[\s]*)(?<quote>['"])(?<import>\.[^'"]+)['"]/g
          return {
            code: code.replace(regexEsm, 'from$<space>$<quote>$<import>.js$<quote>'),
          }
        }
      },
    },
  ],
}

export default defineConfig([config])
