/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        agro: {
          green: '#2d6a4f',
          light: '#52b788',
          bg: '#f0fdf4',
        },
      },
    },
  },
  plugins: [],
};
