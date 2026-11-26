/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  important: true,
  theme: {
    extend: {
      screens: {
        'fl-sm': '600px',
        'fl-md': '960px',
        'fl-lg': '1280px',
        'fl-xl': '1920px',
      },
      colors: {
        'formatif-blue': '#3939ff',
        'formatif-blue-lighter': '#e7e7ff',
      },
    },
  },
  plugins: [],
};
