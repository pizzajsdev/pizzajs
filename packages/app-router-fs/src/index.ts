import fs from 'node:fs'
import path from 'node:path'
import type { RouteDefinition } from './types'

export class FileSystemRouter {
  private fileExts: string[]
  private fileExtsMatcher: string
  private cwd: string

  constructor(fileExts: string[] = ['.tsx', '.ts'], cwd?: string) {
    this.fileExts = fileExts
    this.fileExtsMatcher = `(${fileExts.map((ext) => ext.replace('.', '')).join('|')})`
    this.cwd = cwd ?? process.cwd()
  }

  private isSupportedFile(filename: string): boolean {
    return this.fileExts.some((ext) => filename.endsWith(ext))
  }

  private isIndexFile(filename: string): boolean {
    return filename.match(new RegExp(`^(index|page)\.${this.fileExtsMatcher}$`)) !== null
  }

  private isLayoutFile(filename: string): boolean {
    return (
      filename.match(new RegExp(`^layout\.${this.fileExtsMatcher}$`)) !== null ||
      filename.match(new RegExp(`\/layout\.${this.fileExtsMatcher}$`)) !== null
    )
  }

  private isDtsFile(filename: string): boolean {
    // matches .d.ts, .d.json.ts, etc.
    return filename.endsWith('.d.ts') || filename.match(/\.d\.([a-z0-9]+).ts$/) !== null
  }

  private isIgnoredPath(filename: string): boolean {
    return filename.startsWith('_')
  }

  private isGrouping(filename: string): boolean {
    return /^\(.*\)$/.test(filename)
  }

  private isSplatRoute(filename: string): boolean {
    return filename.startsWith('[...') && filename.endsWith(']')
  }

  private isDynamicRoute(filename: string): boolean {
    return filename.startsWith('[') && filename.endsWith(']')
  }

  private transformSegment(routeName: string, basePath: string): string {
    let routePath = ''
    if (routeName === 'index' || routeName === 'page') {
      routePath = basePath
    } else if (this.isSplatRoute(routeName)) {
      // Catch-all or Splat route, @see https://reactrouter.com/start/framework/routing#splats
      // const param = routeName.slice(4, -1)
      routePath = path.join(basePath, '*')
    } else if (this.isDynamicRoute(routeName)) {
      // Dynamic segment route
      let param = routeName.slice(1, -1)
      if (param.startsWith('[') && routeName.endsWith(']')) {
        // Optional segment route
        param = param.slice(1, -1) + '?'
      }
      routePath = path.join(basePath, `:${param}`)
    } else {
      routePath = path.join(basePath, routeName)
    }

    // Clean up the route path
    routePath = routePath.replace(/\\/g, '/') // Convert Windows paths
    return routePath
  }

  public collectRoutes(
    dir: string = 'app/routes',
    basePath: string = '',
    parentLayoutFile: string | null = null,
  ): RouteDefinition[] {
    const routesDir = path.join(this.cwd, dir)
    const entries = fs.readdirSync(routesDir, { withFileTypes: true })
    const routes: RouteDefinition[] = []
    let layoutFile: string | null = parentLayoutFile

    // First pass: find layout file if it exists
    for (const entry of entries) {
      if (!entry.isDirectory() && this.isLayoutFile(entry.name)) {
        layoutFile = path.join(dir, entry.name).replace(/\\/g, '/')
        break
      }
    }

    // Sort entries to ensure index files come first
    entries.sort((a, b) => {
      if (this.isIndexFile(a.name)) return -1
      if (this.isIndexFile(b.name)) return 1
      return a.name.localeCompare(b.name)
    })

    // Second pass: process all routes
    const processedRoutes: RouteDefinition[] = []
    for (const entry of entries) {
      // Skip files/folders starting with underscore and layout files (handled separately)
      if (this.isIgnoredPath(entry.name) || this.isLayoutFile(entry.name)) {
        continue
      }

      const routeName = entry.name.replace(new RegExp(`\\.${this.fileExtsMatcher}$`), '') // Remove extensions

      if (entry.isDirectory()) {
        // Skip if directory is a special route directory (starts with underscore)
        if (routeName.startsWith('_')) {
          continue
        }

        // Handle parentheses folders - they don't count as segments
        const newBasePath = this.isGrouping(routeName)
          ? basePath
          : path.join(basePath, this.transformSegment(routeName, ''))
        const childRoutes = this.collectRoutes(path.join(dir, entry.name), newBasePath, layoutFile)
        processedRoutes.push(...childRoutes)
      } else {
        // Skip non-route files
        if (
          this.isDtsFile(entry.name) || // Skip d.ts files
          !this.isSupportedFile(entry.name) || // Skip if not matching any supported extension
          this.isIgnoredPath(entry.name) || // Skip ignored files and dirs with leading underscore
          this.isLayoutFile(entry.name) // Skip layout files
        ) {
          continue
        }

        let routePath = this.transformSegment(routeName, basePath)
        let routeFilePath = path.join(dir, entry.name)

        // Clean up the route path
        routePath = routePath.replace(/\\/g, '/') // Convert Windows paths
        if (routePath.startsWith('/')) {
          routePath = routePath.slice(1)
        }

        processedRoutes.push({
          route: routePath,
          layout: layoutFile,
          filename: routeFilePath,
        })
      }
    }

    // If we found a layout file, create a layout route with all siblings
    if (layoutFile && layoutFile !== parentLayoutFile) {
      routes.push({
        filename: layoutFile,
        isLayout: true,
        siblings: processedRoutes,
      })
    } else {
      routes.push(...processedRoutes)
    }

    return routes
  }

  private getRoutesAsTable(routes: RouteDefinition[]): { route: string; filename: string; layout: string }[] {
    return routes.flatMap((r) => {
      if (r.isLayout) {
        return this.getRoutesAsTable(r.siblings)
      }
      return [{ route: '/' + r.route, filename: r.filename, layout: r.layout ?? 'root' }]
    })
  }

  public debug(routes: RouteDefinition[]) {
    console.log(JSON.stringify(routes, null, 2))
    const tableData = this.getRoutesAsTable(routes)
    console.log('\n🚀 Route List:')
    console.table(tableData)
    console.log('Supported page extensions:', this.fileExts.join(', '))
  }
}

export function collectRoutes(
  basePath: string = 'app/routes',
  fileExts: string[] = ['.tsx', '.ts'],
  cwd?: string,
): RouteDefinition[] {
  return new FileSystemRouter(fileExts, cwd).collectRoutes(basePath)
}
