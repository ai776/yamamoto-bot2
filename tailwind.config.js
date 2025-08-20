/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'line-blue': '#3B82F6',
        'line-green': '#00B900',
        'message-yellow': '#FEF08A',
      },
    },
  },
  plugins: [],
}
