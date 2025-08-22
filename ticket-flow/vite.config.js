import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: ['ygzl4n-8000.csb.app'], // 👈 add your sandbox host here
    host: true,  // 👈 this makes Vite listen on all network interfaces
  },
})
