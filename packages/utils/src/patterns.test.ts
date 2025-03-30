import { describe, expect, it } from 'vitest'
import { Pipeline, pipeline as fnPipeline } from './patterns'

describe('Pipeline', () => {
  describe('constructor', () => {
    it('should create a pipeline with initial value', () => {
      const pipeline = new Pipeline(5)
      expect(pipeline.unwrap()).toBe(5)
    })
  })

  describe('pipe', () => {
    it('should apply single transformation', () => {
      const pipeline = new Pipeline(5)
      const result = pipeline.pipe((x) => x * 2)
      expect(result.unwrap()).toBe(10)
    })

    it('should chain multiple transformations', () => {
      const pipeline = new Pipeline(5)
      const result = pipeline
        .pipe((x) => x * 2)
        .pipe((x) => x + 3)
        .pipe((x) => x.toString())
      expect(result.unwrap()).toBe('13')
    })

    it('should handle different types in the pipeline', () => {
      const pipeline = new Pipeline('hello')
      const result = pipeline
        .pipe((str) => str.length)
        .pipe((len) => len * 2)
        .pipe((num) => num > 8)
      expect(result.unwrap()).toBe(true)
    })

    it('should work with complex transformations', () => {
      interface User {
        name: string
        age: number
      }

      const user: User = { name: 'John', age: 30 }

      const result = new Pipeline(user)
        .pipe((u) => u.age)
        .pipe((age) => age >= 18)
        .pipe((isAdult) => (isAdult ? 'Adult' : 'Minor'))

      expect(result.unwrap()).toBe('Adult')
    })

    it('should work with async functions', async () => {
      const result = await new Pipeline(Promise.resolve(5))
        .pipe(async (x) => {
          const result = await x
          return result * 2
        })
        .unwrap()

      expect(result).toBe(10)
    })
  })
})

describe('pipeline()', () => {
  it('should create a pipeline with the given value', () => {
    const pipeline = fnPipeline(10)
    expect(pipeline.unwrap()).toBe(10)
  })
})
