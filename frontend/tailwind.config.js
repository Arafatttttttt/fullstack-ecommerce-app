/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary orange
          600: '#ea580c', // Primary orange dark
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Amazon-style colors (keeping for backward compatibility)
        amazon: {
          dark: '#131921',
          darker: '#0f1419',
          orange: '#f97316',
          light: '#f3f4f6',
        },
        'amazon-orange': '#f97316',
        // Status Colors
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Consistent typography scale
        'display': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.5', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        // Consistent spacing scale
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        // Consistent border radius
        'card': '0.75rem', // 12px - for cards
        'button': '0.5rem', // 8px - for buttons
        'badge': '9999px', // Full rounded for badges
      },
      boxShadow: {
        // Consistent shadows
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'button-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}