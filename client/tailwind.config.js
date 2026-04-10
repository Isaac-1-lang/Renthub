/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB',  // Rwanda-inspired blue
          light:   '#EFF6FF',
          dark:    '#1D4ED8',
        },
      },
      screens: {
        'xs':  '500px',
        'xxs': '400px',
        '2xl': '1730px',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
}
