const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.lime[300], 
          strong: colors.lime[600], 
        },
        ink: {
          DEFAULT: colors.zinc[900], 
          muted: colors.zinc[500], 
          faint: colors.zinc[400], 
        },
        line: colors.zinc[200],
        track: colors.zinc[100], 
        danger: colors.red[600],
      },
      fontFamily: {
        host: ["HostGrotesk-Regular"],
        "host-light": ["HostGrotesk-Light"],
        "host-medium": ["HostGrotesk-Medium"],
        "host-semibold": ["HostGrotesk-SemiBold"],
        "host-bold": ["HostGrotesk-Bold"],
      },
    },
  },
  plugins: [],
};