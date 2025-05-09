import { defineConfig } from 'tsup'

import pkg from './package.json'

const entry = ['cli.ts']

function createBanner(packageName: string, version: string) {
  return `/**
 * ${packageName} v${version}
 *
 * Copyright (c) pizzajs.dev
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */`
}

export default defineConfig([
  {
    clean: true,
    entry,
    format: ['cjs'],
    outDir: 'dist',
    dts: true,
    banner: {
      js: createBanner(pkg.name, pkg.version),
    },
  },
])
