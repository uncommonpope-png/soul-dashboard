/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050508',
        'panel-base': 'rgba(15, 20, 35, 0.6)',
        'panel-border': 'rgba(0, 212, 255, 0.15)',
        'plasma-cyan': '#00d4ff',
        'plasma-green': '#00ff88',
        'plasma-amber': '#ffaa00',
        'plasma-red': '#ff3366',
        'text-primary': '#e8f4ff',
        'text-muted': '#5a7a9a',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'Rajdhani', 'Arial Black', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
        space: ['Space Mono', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        panel: '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};