# app-router-fs

A route collector heavily inspired by Next.js's App Router and compatible with React Router v7+

## Features

Supports all route types of [the official docs](https://reactrouter.com/start/framework/routing):

- Root and index routes: Either `index.tsx` or `page.tsx`, but a segment folder is not required, e.g. `posts.tsx` is the
  same as `posts/index.tsx`
- Dynamic Segments: `posts/[id].tsx` or `posts/[id]/index.tsx`
- Optional Segments: `[[lang]]/news.tsx`
- Splat/Wildcard routes: `api/auth/[...].tsx`
- Layout routes: `layout.tsx` at any level, inheritable.
- Extras inspired by Next:
  - Route grouping (via parentheses): `(auth)/news.tsx` will be `/news`. Has no effect more than code organisation
    purposes or for sharing the same layout without requiring a nested level.

Supports both `.ts` and `.tsx` files, depends if you use JSX inside or not.

## Setup

It requires React Router v7 or compatible.

```bash
echo "@pizzajsdev:registry=https://npm.pkg.github.com" >> .npmrc
pnpm add @pizzajsdev/app-router-fs
```

## Usage

### React Router v7+

Edit the `app/routes.ts` file to use the generated routes.

```ts
import { collectRoutes } from '@pizzajsdev/app-router-fs'
import { createRouterConfig } from '@pizzajsdev/app-router-fs/adapters/react-router'

export const collectedRoutes = collectRoutes('routes', ['.tsx', '.ts'], process.cwd() + '/app')
const routes = createRouterConfig(collectedRoutes)

export default routes
```
