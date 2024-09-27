import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        themeGreyColor: "var(--themeGreyColor)",
        themeBlueColor: "var(--themeBlueColor)",
        themeYellowColor: "var(--themeYellowColor)",
        themelightGreyColor: "var(--themelightGreyColor)",
        themeDarkGreyColor: "var(--themeDarkGreyColor)",
        themeSilverGreyColor: "var(--themeSilverGreyColor)",
      },
    },
  },
  plugins: [],
};
export default config;
