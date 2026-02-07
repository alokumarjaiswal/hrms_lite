/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple System Grays (Dark Mode)
        systemGray6: '#1c1c1e',
        systemGray5: '#2c2c2e',
        systemGray4: '#3a3a3c',
        systemGray3: '#48484a',
        systemGray2: '#636366',
        systemGray: '#8e8e93',
        
        // Apple System Colors
        systemBlue: '#0a84ff',
        systemIndigo: '#5e5ce6',
        systemRed: '#ff453a',
        systemGreen: '#32d74b',
        systemYellow: '#ffd60a',
        
        // Functional aliases
        background: '#1c1c1e',
        surface: '#2c2c2e',
        border: '#3a3a3c',
        text: '#ffffff',
        textSecondary: '#8e8e93',
      },
      fontFamily: {
        mono: [
          'SF Mono',
          'Roboto Mono',
          'JetBrains Mono',
          'Consolas',
          'Courier New',
          'monospace'
        ],
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
      },
      boxShadow: {
        none: 'none',
        DEFAULT: 'none',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
      },
    },
  },
  plugins: [],
  // Disable all border-radius and box-shadow utilities
  corePlugins: {
    borderRadius: false,
    boxShadow: false,
  },
}
