export function getAbsUrl(path?: string, baseUrl = '/'): string {
  if (!path) {
    return baseUrl
  }

  return joinUrlParts(baseUrl, path)
}

export function joinUrlParts(baseUrl: string, ...parts: string[]) {
  const base = baseUrl.replace(/\/$/, '')
  return base + '/' + parts.join('/').replace(/\/+/g, '/').replace(/^\//, '').replace(/\/$/, '')
}
