export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) {
    nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
      if (msg.includes('Invalid prop: type check failed for prop "rows"') || msg.includes('[Vue warn]: Failed to resolve component: UText')) return
      // You can add more filters here if needed
      console.warn(msg, trace)
    }
  }
})