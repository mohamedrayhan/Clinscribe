/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F6F7F5',
        surface: '#FFFFFF',
        text: {
          primary: '#17201D',
          secondary: '#68716D',
        },
        border: '#DDE2DF',
        accent: '#1F6B57',
        success: '#2F7D5C',
        warning: '#B7791F',
        critical: '#B42318',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
