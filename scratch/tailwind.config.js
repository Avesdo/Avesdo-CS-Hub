/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      fontSize: {
        'tiny': ['10px', '14px'], 'xs': ['11px', '16px'], 'sm': ['13px', '20px'], 'base': ['14px', '24px'], 'lg': ['18px', '28px'], 'xl': ['20px', '28px'], '2xl': ['24px', '32px'], '3xl': ['30px', '36px'] },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)"
        },
        blue: { 50: '#e0f8fb', 100: '#b3ecf4', 200: '#80dfed', 300: '#4dd2e5', 400: '#26c7e0', 500: '#00bdd9', 600: '#00abc6', 700: '#0087a1', 800: '#00657a', 900: '#004454' },
        blue: { 50: '#e0f8fb', 100: '#b3ecf4', 200: '#80dfed', 300: '#4dd2e5', 400: '#26c7e0', 500: '#00bdd9', 600: '#00abc6', 700: '#0087a1', 800: '#00657a', 900: '#004454' },
        red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 500: '#e7000b', 600: '#e7000b', 700: '#e7000b' },
        emerald: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 500: '#5ea500', 600: '#5ea500', 700: '#5ea500' },
        lime: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 500: '#5ea500', 600: '#5ea500', 700: '#5ea500' },
        green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 500: '#5ea500', 600: '#5ea500', 700: '#5ea500' },
        orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 500: '#fe9a00', 600: '#fe9a00', 700: '#fe9a00' },
        amber: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 500: '#fe9a00', 600: '#fe9a00', 700: '#fe9a00' },
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
}

