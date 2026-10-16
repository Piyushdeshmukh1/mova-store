import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem", xl: "3rem" }, screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        forest: { DEFAULT: "#123C35", 700: "#0E302A", 600: "#1A4D44", 50: "#E8EFED" },
        cream: { DEFAULT: "#F8F5EF", 200: "#F1ECE2", 300: "#E7E0D2" },
        mint: { DEFAULT: "#B8E3D5", 200: "#D6F0E7", 600: "#8FCFB9" },
        coral: { DEFAULT: "#FF8066", 600: "#F2664A", 100: "#FFE6E0" },
        charcoal: "#202725",
        sage: { DEFAULT: "#71837C", 200: "#C9D2CE" },
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 9vw, 8.5rem)", { lineHeight: "0.9", letterSpacing: "-0.045em" }],
        "display-lg": ["clamp(2.25rem, 5.5vw, 4.75rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.75rem" },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(28px)" }, to: { opacity: "1", transform: "none" } },
        reveal: { from: { clipPath: "inset(100% 0 0 0 round 2rem)" }, to: { clipPath: "inset(0 0 0 0 round 2rem)" } },
        float: { "0%,100%": { transform: "translateY(0) rotate(-2deg)" }, "50%": { transform: "translateY(-12px) rotate(1deg)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        pop: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.35)" }, "100%": { transform: "scale(1)" } },
        slidein: { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
        slideinleft: { from: { transform: "translateX(-100%)" }, to: { transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        rise: "rise .9s cubic-bezier(.2,.7,.2,1) both",
        reveal: "reveal 1.2s cubic-bezier(.7,0,.2,1) both",
        float: "float 7s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        pop: "pop .45s ease-out",
        slidein: "slidein .45s cubic-bezier(.2,.7,.2,1) both",
        slideinleft: "slideinleft .45s cubic-bezier(.2,.7,.2,1) both",
        fade: "fade .3s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
