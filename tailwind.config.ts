import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        mist: "#F4F6FA",
        cyan: "#0EA5E9",
        amber: "#F59E0B",
      },
    },
  },
  plugins: [],
};

export default config;
