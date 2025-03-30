import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const dayJsExtended = dayjs

export function addSecondsToDate(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000)
}

export function isDateExpired(expirationDate: Date): boolean {
  return Date.now() >= expirationDate.getTime()
}

export function newDate(value?: number | string | Date): Date {
  if (value) {
    return new Date(value)
  }
  return new Date()
}

export function newDateUTC(value?: number | string | Date): Date {
  const date = newDate(value)
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  )
}

export function newFutureDate(addedMilliseconds: number): Date {
  return new Date(Date.now() + addedMilliseconds)
}

export function nowMs(): number {
  return Date.now()
}

export function relativeTimeFromNow(date: string | Date): string {
  return dayJsExtended(date).fromNow()
}

export function dateToSqlDateTime(date: string | Date): string {
  return dayJsExtended(date).format('YYYY-MM-DD HH:mm:ss')
}
