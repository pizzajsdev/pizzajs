export function slugize(slug: string): string {
  return slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\s]/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .replace(/[-]+/g, '-')
    .replace(/[_]+/g, '_')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

export function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

export function strSplitEvery(str: string, segmentLength = 4): string[] {
  const parts = []
  let currentIndex = 0

  while (currentIndex < str.length) {
    parts.push(str.substring(currentIndex, Math.min(str.length, currentIndex + segmentLength)))
    currentIndex += segmentLength
  }

  return parts
}

// This function is used to sanitize the text that is entered by the user in the editor,
// e.g. a plain-text bio for their profile. It removes any leading or trailing whitespace from the text.
export function sanitizeProseText(text: string): string {
  const text2 = text
    // Remove URL protocols
    .replace(/(https:\/\/, http:\/\/)/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Replace multiple newlines with a single newline
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n')

  // if there are more than 5 newlines, remove the rest:
  const splitText = text2.split('\n')
  const text3 = splitText.slice(0, 5).join('\n') + splitText.slice(5).join(' ')

  // replace multiple spaces with a single space, but keep newlines
  const text4 = text3
    .replace(/\n/g, '<br>')
    .replace(/\s{2,}/g, ' ')
    .replace(/<br>/g, '\n')

  // Replace multiple spaces with a single space
  return text4
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function capitalizeWords(string: string): string {
  return string.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale = 'en-US',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string {
  if (!currency) {
    throw new Error('Currency is required and cannot be empty')
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  }).format(amount / 100) // Convert cents
}

export const romanNumerals: { [key: number]: string } = {
  1000: 'M',
  900: 'CM',
  500: 'D',
  400: 'CD',
  100: 'C',
  90: 'XC',
  50: 'L',
  40: 'XL',
  10: 'X',
  9: 'IX',
  5: 'V',
  4: 'IV',
  1: 'I',
}

export function numberToRomanNumerals(num: number): string {
  let result = ''
  for (const value of Object.keys(romanNumerals)
    .map(Number)
    .sort((a, b) => b - a)) {
    while (num >= value) {
      result += romanNumerals[value]
      num -= value
    }
  }
  return result
}

export function replaceTemplateVariables(str: string, variables: Record<string, any>): string {
  return str.replace(/\{(.*?)\}/g, (match, p1) => variables[p1] || match)
}
