/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: '#E2E8F0',
        accent: '#0284C7', // Clinical Deep Sky / Primary
        'accent-hover': '#0369A1',
        success: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444',
        
        // Full SaaSable Palette
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BAE0FF',
          300: '#7CC4FA',
          400: '#38A4F4',
          500: '#0284C7', // main
          600: '#0369A1',
          700: '#075985',
          800: '#0C4A6E',
          900: '#082F49',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        clinical: {
          blue: '#0284C7',
          emerald: '#10B981',
          violet: '#6366F1',
          amber: '#F59E0B',
          rose: '#EF4444',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'dropdown': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
