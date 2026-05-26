import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          50: "#eefbf8",
          100: "#d6f4ec",
          500: "#079a86",
          600: "#087c70",
          700: "#096359",
          900: "#123c3b"
        },
        emergency: "#d94841"
      },
      boxShadow: {
        card: "0 12px 32px rgba(12, 70, 65, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
