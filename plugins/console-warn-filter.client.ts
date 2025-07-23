// plugins/console-warn-filter.client.ts
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return

  const filters = [
    'Invalid prop: type check failed',
    'Extraneous non-props',
    'Missing required prop',
    'Avoid mutating a prop directly',
    'Component is missing template or render function',
    'is not a valid component name',
    'but the declaration was not found',
    'Failed to resolve component: UText',
    '[Vue warn]: Invalid prop: type check failed for prop "rows".',
    'Failed to stringify dev server logs.',
  ]

  const originalWarn = console.warn

  console.warn = (...args) => {
    const msg = args[0]
    if (typeof msg === 'string' && filters.some(f => msg.includes(f))) return

    originalWarn(...args)
  }
})
