export function base64Encode(str: string): string {
  if (typeof Buffer === 'undefined') {
    return btoa(str)
  }
  return Buffer.from(str).toString('base64')
}

export function base64Decode(str: string): string {
  if (typeof Buffer === 'undefined') {
    return atob(str)
  }
  return Buffer.from(str, 'base64').toString()
}

export function base64UrlEncode(str: string): string {
  return base64Encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function base64UrlDecode(str: string): string {
  return base64Decode(str.replace(/-/g, '+').replace(/_/g, '/'))
}

export function dataUriToBuffer(dataUri: string): Uint8Array {
  const base64 = dataUri.split(',')[1]
  const binary = base64Decode(base64)
  const uint8Array = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i)
  }
  return uint8Array
}

export function bufferToDataUri(buffer: Uint8Array, type: string): string {
  const binary = String.fromCharCode(...buffer)
  const base64 = base64Encode(binary)
  return `data:${type};base64,${base64}`
}

export type DeepKeyValueObj = {
  [key: string]: DeepKeyValueObj | string | number | boolean | null
}

/**
 * Flattens a deeply nested key-value object into a single level of keys
 * Keys are combined with a dot notation
 */
export function flattenObject(obj: Record<string, any>, separator = '.'): Record<string, any> {
  const flattened: Record<string, any> = {}
  for (const key in obj) {
    if (typeof obj[key] !== 'object' && !Array.isArray(obj[key])) {
      flattened[key] = obj[key]
    } else {
      const nested = flattenObject(obj[key])
      for (const nestedKey in nested) {
        flattened[`${key}${separator}${nestedKey}`] = nested[nestedKey]
      }
    }
  }
  return flattened
}
