const colors = require('./src/styles/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors,
    extend: {
      fontFamily: {
        'sans-light': ['HostGrotesk-Light'],
        'sans-regular': ['HostGrotesk-Regular'],
        'sans-medium': ['HostGrotesk-Medium'],
        'sans-semiBold': ['HostGrotesk-SemiBold'],
        'sans-bold': ['HostGrotesk-Bold'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
    },
  },
  plugins: [],
};
