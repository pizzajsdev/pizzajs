import { z } from 'zod'

export function zodErrorSummarize(error: z.ZodError | unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (!(error instanceof z.ZodError)) {
    return 'An error occurred.'
  }

  return (
    'The following errors occurred: ' +
    error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('. ') +
    '.'
  )
}

export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug')
export const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, 'Invalid hex color')

export const seoTitleSchema = z.string().max(60, 'SEO title must be less than 60 characters')
export const seoDescriptionSchema = z.string().max(155, 'SEO description must be less than 155 characters')
