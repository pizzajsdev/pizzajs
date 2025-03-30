import { customAlphabet, nanoid } from 'nanoid'
import { newDate, nowMs } from './dates'

const UNIX_EPOCH_MS = 1609459200000
const KSUID_PREXIX_REGEX = /^([a-z]{1,})([a-z0-9]{0,})-?$/
const KSUID_DEFAULT_MAX_ID_LENGTH = 24
const KSUID_NUM_RANDOM_BYTES = 4
const DEFAULT_NANOID_SIZE = 16

const unambiguousAlphabet = 'AaBbCcDdEeFfGgHhIiJjKkLMmNnOPpQqRrSsTtUuVvWwXxYyZz2345678'
const unambiguousNanoid = customAlphabet(unambiguousAlphabet, DEFAULT_NANOID_SIZE)

export function generateUnambiguousNanoId(prefix = '', size = DEFAULT_NANOID_SIZE): string {
  return `${prefix}${unambiguousNanoid(size)}`.replace(/-/g, '')
}

export function generateNanoId(prefix = '', size = DEFAULT_NANOID_SIZE): string {
  return `${prefix}${nanoid(size)}`.replace(/-/g, '')
}

export function generateTimestampId(prefix = 't-', suffix = '', randomLength = 3): string {
  const randHex = randomLength > 0 ? generateRandomHexString(randomLength) : ''
  const fullSuffix = `${randHex}${suffix}`
  return `${prefix}${nowMs()}${fullSuffix.length > 0 ? `-${fullSuffix}` : ''}`
}

export function generateDatetimeId(prefix = 'd-', suffix = '', randomLength = 3): string {
  const randHex = randomLength > 0 ? generateRandomHexString(randomLength) : ''
  const fullSuffix = `${randHex}${suffix}`
  const datetime = newDate().toISOString().replace(/[-:Z]/g, '')
  return `${prefix}${datetime}${fullSuffix.length > 0 ? `-${fullSuffix}` : ''}`
}

/**
 *
 * A simple implementation of a K-Sortable Unique ID Generator.
 *
 * - __Security__: Similar to CUIDs, KSUIDs are not cryptographically secure. They are not meant to be used as secrets,
 *    but they can be used as unique identifiers for things like database records, or as keys for caches.
 *    - _Uniqueness_: KSUIDs are unique across machines, and are guaranteed to be unique for 1 millisecond, even if
 *      generated on different machines that are not synchronized.
 *    - _Sortability_: KSUIDs are sortable by generation time, and can be used as keys in databases that are sorted by
 *      creation time. In distributed systems, make sure they all use the same epoch, and that the clocks are
 *     synchronized.
 *    - _Predictability_ of the next ID: KSUIDs are somehow predictable for the first bits, but not for the last ones.
 *    - _Leaks_: KSUIDs partially leak how many IDs have been generated in a given time period, the creation date,
 *      and the machine ID, even though these parts are obfuscated, it is recommended to use a dedicated machine ID
 *      only for KSUID generation.
 *    - _Collision resistance_: KSUIDs are collision resistant, but it depends on how you configure the generator.
 *      The probability of collision is zero on a well-configured instance, where the provided machine ID is unique in
 *      your infrastructure, and the clock is monotonically increasing.
 * - __Performance__: KSUIDs are much faster to generate than ULIDs and CUIDs (v1 and v2), but slower than UUIDs.
 *   Speed is comparable to "nanoid", which is one of the fastest, and beats it in some cases.
 *
 * The anatomy or bit distribution of a KSUID is as follows:
 *
 * - Time (8 base36 chars): milliseconds since epoch + Sequence/Counter (rotl-3x)
 * - Machine ID (5 base36 chars): Any integer up to 99_999 (like the PID + PPID of the current process) (rotl-3x)
 * - Randomness (8 hex chars): 4 random bytes, converted to hex (base16)
 *
 * @example 'pk-95dno5kw-0g57s-5f202b4a' // (26 chars, with prefix and separator)
 * @example '95domqy00g5u00870a7d2' // (21 chars)
 * @see https://adileo.github.io/awesome-identifiers/
 */
export class KSortableUniqueIdGenerator {
  private epoch: number
  private machineId = '' // Vercel doesn't provide a machine ID, so we use an empty string
  private maxLength: number
  private sequence = 0n
  private lastTimestamp = -1

  constructor(maxLength: number = KSUID_DEFAULT_MAX_ID_LENGTH, epoch: number = UNIX_EPOCH_MS) {
    this.maxLength = maxLength
    this.epoch = epoch ?? UNIX_EPOCH_MS
  }

  nextId(prefix = '', separator = ''): string {
    const timestamp = this.currentTimestamp()

    if (prefix.length > 0 && !prefix.match(KSUID_PREXIX_REGEX)) {
      throw new Error(
        'Invalid prefix. It should be in lowercase base36, start with a letter, and optionally end with a hyphen.',
      )
    }

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate ID.')
    }

    if (timestamp === this.lastTimestamp) {
      if (this.sequence > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error('Max number of IDs generated in the same millisecond (Number.MAX_SAFE_INTEGER).')
      }
      this.sequence++
    }

    this.lastTimestamp = timestamp

    const _timestampSeq = BigInt(this.lastTimestamp - this.epoch) + this.sequence
    const _randomBytes = generateRandomHexString(KSUID_NUM_RANDOM_BYTES)

    const _timingComponent = bigIntToBase36(rotlBigInt(_timestampSeq, 1n)).padStart(9, '0') // will be 9 chars long until year 5138

    const baseId = [_timingComponent, this.machineId, _randomBytes].filter(Boolean).join(separator)

    const baseLength = baseId.length - separator.length * 2
    const id = prefix + baseId

    if (id.length > this.maxLength) {
      throw Error(
        `KSUID length must be from ${baseLength} to ${this.maxLength} characters or less, got ${id.length}: '${id}'.`,
      )
    }

    return id
  }

  private currentTimestamp(): number {
    return nowMs()
  }
}

export const defaultKsuidGenerator = new KSortableUniqueIdGenerator()

export function generateKsuid(prefix = 'k', separator = '', generator = defaultKsuidGenerator): string {
  return generator.nextId(prefix, separator)
}

// export const RUNTIME_PROCESS_UID = Math.min((process.pid ?? 0) + (process.ppid ?? 0), 9999)
// export const ALPHANUM_ALPHABET = /*~~~~~~~~~~~~~*/ '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
// export const ALPHANUM_ALPHABET_UNAMBIGUOUS = /*~*/ '0123456789abcdefghijkmnpqrstuwxyzABCDEFGHJKLMNPQRSTUWXYZ'
// export const ALPHANUM_ALPHABET_LC = /*~~~~~~~~~~*/ '0123456789abcdefghijklmnopqrstuvwxyz'

export function generateRandomHexString(length: number) {
  // Calculate the number of bytes needed, each byte becomes two hex characters
  const bytes = new Uint8Array(Math.ceil(length / 2))
  // Populate the array with random values
  crypto.getRandomValues(bytes)
  // Convert each byte to a hexadecimal string and concatenate them
  let hexString = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  // If the desired length is odd, we remove the last character to match the specified length
  if (length % 2 !== 0) {
    hexString = hexString.substring(0, hexString.length - 1)
  }
  return hexString
}

export function bigIntToBase36(num: bigint, numDigits?: number): string {
  const value = num.toString(36)

  if (numDigits) {
    return value.padStart(numDigits, '0')
  }

  return value
}

/**
 * Rotates a 64-bit number to the left by a given number of bits.
 */
export function rotlBigInt(num: bigint, rotationBits = 1n): bigint {
  if (rotationBits === 0n) {
    return num
  }
  return (num << rotationBits) | (num >> (64n - rotationBits))
}
