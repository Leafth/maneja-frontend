/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
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
