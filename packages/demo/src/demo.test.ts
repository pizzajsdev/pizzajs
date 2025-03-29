import { expect, it } from 'vitest'
import { pizzajsDemoPkg } from './index'

it('pizzajsDemoPkg', () => {
  expect(pizzajsDemoPkg()).toBe('Hello, world!')
})
