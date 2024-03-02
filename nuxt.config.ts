// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    public: {
      baseAppUrl: '',
      baseApiUrl: ''
    }
  },
  nitro: {
    azure: {
      config: {
        // ...
        platform: {
          apiRuntime: 'node:18'
        }
      }
    }
  }
})
