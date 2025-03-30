export const truthyEnvValues = ['1', 'true', 'yes', 'ok', 'on'] as const
export const falsyEnvValues = ['0', 'false', 'no', 'off', 'null', 'undefined', ''] as const

export async function sleepMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function dlog(...args: any[]) {
  if (getBoolEnvVar('APP_DEBUG')) {
    console.debug(...args)
  }
}

export function isTruthyEnvValue(value: any) {
  return truthyEnvValues.includes(String(value).trim().toLowerCase() as any)
}

export function isFalsyEnvValue(value: any) {
  return falsyEnvValues.includes(String(value).trim().toLowerCase() as any)
}

/**
 * Returns a raw value of an environment variable.
 * It supports process.env and import.meta.env.
 */
export function getEnvVar<T extends string | undefined>(
  key: string,
  defaultValue?: T,
): T extends string ? string : string | undefined {
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    return (process.env[key] ?? defaultValue) as any
  }

  const importMeta = import.meta as any
  if (typeof importMeta?.env !== 'undefined') {
    return (importMeta.env[key] ?? defaultValue) as any
  }
  // if (typeof globalThis !== 'undefined' && typeof (globalThis as any).ENV !== 'undefined') {
  //   return ((globalThis as any).ENV[name] ?? defaultValue) as any;
  // }
  return defaultValue as any
}

/**
 * Returns a boolean value of an environment variable.
 * It supports process.env and import.meta.env.
 */
export function getBoolEnvVar(key: string): boolean {
  return isTruthyEnvValue(getEnvVar(key, undefined))
}

export function isServerSide() {
  return typeof window === 'undefined' && typeof document === 'undefined'
}

export function isClientSide() {
  return !isServerSide()
}

export function assertServerOnly() {
  if (isClientSide()) {
    throw new Error('This file should not be imported in the browser')
  }
}

export function assertClientOnly() {
  if (isServerSide()) {
    throw new Error('This file should not be imported on the server')
  }
}

/**
 * Returns the absolute base URL from the environment variable APP_URL.
 * Defaults to 'http://localhost:3000' if the environment variable is not set.
 */
export function getBaseUrl() {
  return getEnvVar('APP_URL', 'http://localhost:3000')
}

/**
 * Returns the environment name from the environment variable APP_ENV. Defaults to 'development'.
 */
export function getEnvName() {
  return getEnvVar('APP_ENV', 'development')
}

export function isDevelopment() {
  return getEnvName() === 'development'
}

export function isProduction() {
  return getEnvName() === 'production'
}
