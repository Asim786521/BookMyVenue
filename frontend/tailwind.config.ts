import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        teal: "#14b8a6",
        saffron: "#f59e0b"
      }
    }
  },
  plugins: []
};

export default config;
