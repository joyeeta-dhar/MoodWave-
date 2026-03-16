/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mood: {
          primary: 'var(--mood-primary)',
          secondary: 'var(--mood-secondary)',
          accent: 'var(--mood-accent)',
        }
      }
    },
  },
  plugins: [],
}
