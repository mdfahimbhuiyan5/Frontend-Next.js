module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },  // Added missing comma here
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
      }
    },
  },
  plugins: [],
}