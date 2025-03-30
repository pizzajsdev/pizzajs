import { newDate, nowMs } from './dates'

const DEFAULT_CACHE_TTL = 60 * 60 * 2 // 2 hours
const DEFAULT_MEMOIZE_CACHE: MemoizeCache = new Map()

export type MemoizeCache = Map<
  string,
  {
    expiresAfter: Date
    data: any
  }
>

/**
 * Memoize an async function to cache the result.
 * The cache is stored in memory (global object) and expires after ttl seconds.
 *
 * @param key - The key to cache the function.
 * @param cacheFn - The function to cache.
 * @param ttl - The number of milliseconds to cache the function. Defaults to 2 hours.
 * @param cache - The cache to use. Defaults to the default memoize cache (local variable).
 * @param logger - The logger to use. Defaults to console.log.
 */
export async function memoizeFn<T>(
  key: string,
  cacheFn: () => Promise<T>,
  ttl = DEFAULT_CACHE_TTL,
  cache = DEFAULT_MEMOIZE_CACHE,
  logger?: typeof console.log,
): Promise<T> {
  const cached = cache.get(key)
  if (!cached) {
    logger?.(`[memory cache miss] Fetching ${key} from PokéPC CDN...`)
    const data = await cacheFn()
    cache.set(key, {
      expiresAfter: newDate(nowMs() + ttl * 1000),
      data,
    })
    return data
  }
  if (cached.expiresAfter < newDate()) {
    logger?.(`[memory cache expired] Fetching ${key} from PokéPC CDN...`)
    cache.delete(key)
    return memoizeFn(key, cacheFn)
  }
  logger?.(`[memory cache hit] ${key}`)
  return cached.data
}

/**
 * Debounce a function to run at most once per waitMs. If a new call is made before the waitMs timeout,
 * the previously scheduled call is cleared and the new call is scheduled.
 *
 * @param func - The function to debounce.
 * @param waitMs - The number of milliseconds to debounce the function
 * @returns A debounced function
 */
export function debounceFn(func: (...args: any[]) => void, waitMs: number) {
  let timeout: ReturnType<typeof setTimeout>
  return function (...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, waitMs)
  }
}

/**
 * Throttle a function to run at most once per throttleMs.
 *
 * The difference between debounce and throttle is that debounce delays the call and clears the previously scheduled
 * call if a new call is made, while throttle runs the function immediately and then limits the rate at which it can
 * fire.
 *
 * @param func - The function to throttle.
 * @param throttleMs - The number of milliseconds to throttle the function
 * @returns A throttled function
 */
export function throttleFn(func: (...args: any[]) => void, throttleMs: number) {
  let inThrottle: boolean
  return function (...args: any[]) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), throttleMs)
    }
  }
}

// ---- PIPELINE PATTERN ----
export type PipelineFunction<T, R> = (arg: T) => R

export class Pipeline<T> {
  private lastFn: T

  constructor(fn: T) {
    this.lastFn = fn
  }

  pipe<R>(fn: PipelineFunction<T, R>): Pipeline<R> {
    return new Pipeline(fn(this.lastFn))
  }

  unwrap(): T {
    return this.lastFn
  }
}

export function pipeline<T>(fn: T) {
  return new Pipeline(fn)
}

// ---- SINGLETON PATTERN ----
// Borrowed & modified from https://github.com/jenseng/abuse-the-platform/blob/main/app/utils/singleton.ts

export function singleton<Value>(name: string, valueFactory: () => Value): Value {
  const yolo = globalThis as unknown as { __singletons: Record<string, unknown> }
  yolo.__singletons ??= {}
  yolo.__singletons[name] ??= valueFactory()
  return yolo.__singletons[name] as Value
}

// ---- PROXY PATTERN ----
/**
 * Creates a readonly proxy of an object.
 */
export function makeReadonlyProxy<T extends object>(data: T): T {
  return new Proxy(data, {
    get(target, prop) {
      if (typeof prop === 'symbol' || prop === 'constructor' || prop === 'prototype') {
        return Reflect.get(target, prop)
      }
      return target[prop as keyof T]
    },
    set() {
      throw new Error('Cannot set properties on readonly object')
    },
  })
}
