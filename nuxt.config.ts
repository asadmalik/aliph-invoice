// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          href: '/favicon.svg', // Point to the favicon file in the static folder
        },
      ],
      script: []
    }

  },

  css: ['~/assets/css/main.css'],
  ui: {
    prefix: 'U',
  },
  future: {
    compatibilityVersion: 4
  },
  plugins: [
    { src: '~/plugins/dexie.client.ts', mode: 'client' }
  ],
  compatibilityDate: '2024-11-27'
})
