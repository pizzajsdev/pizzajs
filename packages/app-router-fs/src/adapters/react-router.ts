import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'
import type { RouteDefinition } from '../types'

export function createRouterConfig(routes: RouteDefinition[]): Awaited<RouteConfig> {
  return routes.map((routeDef) => {
    if (routeDef.isLayout) {
      return layout(routeDef.filename, createRouterConfig(routeDef.siblings || []))
    }
    if (routeDef.route === '') {
      return index(routeDef.filename)
    }
    return route('/' + routeDef.route, routeDef.filename)
  })
}
