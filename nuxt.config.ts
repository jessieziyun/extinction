// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    apiKey: process.env.API_KEY,
    searchEngineId: process.env.SEARCH_ENGINE_ID,
    firebaseApiKey: process.env.FIREBASE_API_KEY
  }
})
