/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        body: "#002a3a", // یا هر رنگ بک‌گراند مناسب سایت
      },
    },
  },
  plugins: [],
};
