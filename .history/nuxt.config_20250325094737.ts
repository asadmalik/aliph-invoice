// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],
  ui: {
    prefix: 'Nuxt'
  },
  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27'
})
