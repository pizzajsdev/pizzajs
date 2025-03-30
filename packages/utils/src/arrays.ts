export function arrayMapBy<T, K extends keyof T = keyof T>(arr: T[], key: K): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [String(item[key]), item]))
}

export function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5)
}
