/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Kantumruy Pro"', '"Noto Sans Khmer"', 'Battambang', 'sans-serif'],
      },
      colors: {
        khmer: {
          blue: '#1E64C8',
          sky: '#38BDF8',
          green: '#10B981',
          emerald: '#059669',
          yellow: '#F59E0B',
          amber: '#D97706',
          purple: '#8B5CF6',
          pink: '#EC4899',
          orange: '#F97316',
          coral: '#F43F5E',
          cream: '#FEF9C3',
          warm: '#FDFBF7'
        }
      },
      boxShadow: {
        'bouncy': '0 8px 0 0 rgba(0, 0, 0, 0.08), 0 15px 25px -5px rgba(0, 0, 0, 0.05)',
        'fun': '0 6px 0 0 rgba(0, 0, 0, 0.12)',
        'fun-active': '0 2px 0 0 rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
