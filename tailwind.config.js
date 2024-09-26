/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#182E54',
        secondary: '#DF3D24',
        tertiary: '#F2F8FF',
      },
      fontFamily: {
        Poppins: ['normal'],
      },
    },
  },
  plugins: [],
};
