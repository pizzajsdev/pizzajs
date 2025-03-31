export type RouteDefinition =
  | {
      route: string
      filename: string
      layout: string | null
      isLayout?: never
      siblings?: never
    }
  | {
      filename: string
      isLayout: true
      siblings: RouteDefinition[]
    }
