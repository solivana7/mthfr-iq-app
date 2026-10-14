/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        amber1: '#EC9247',
        brown1: '#331D01',
        taupe1: '#B49F90',
        cream1: '#F0EDED',
        brown2: '#786455',
      },
      fontFamily: {
        heading: ['Jost', 'system-ui', 'sans-serif'],
        body: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
