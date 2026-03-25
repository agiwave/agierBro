import { beforeAll } from 'vitest'

beforeAll(() => {
  // Mock localStorage
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      _data: {} as Record<string, string>,
      setItem(key: string, value: string) {
        this._data[key] = String(value)
      },
      getItem(key: string) {
        return this._data[key] || null
      },
      removeItem(key: string) {
        delete this._data[key]
      },
      clear() {
        this._data = {}
      }
    },
    writable: true,
    configurable: true
  })
})
