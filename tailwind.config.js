/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f1f5f9',
          border: 'rgba(0, 0, 0, 0.08)',
        },
        dungeon: {
          stone: '#e2e8f0',
          wall: '#94a3b8',
          torch: '#ea580c',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Satoshi', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
        rpg: ['"Pixelify Sans"', '"Silkscreen"', 'sans-serif'],
      },
      borderRadius: {
        'pixel': '4px',
        'pixel-lg': '8px',
        '2.5xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'diffusion': '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
        'stone-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'pixel-sm': '2px 2px 0px #000000',
        'pixel': '3px 3px 0px #000000',
        'pixel-lg': '4px 4px 0px #000000',
      }
    },
  },
  plugins: [],
}
