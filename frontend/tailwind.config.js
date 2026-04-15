/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tema Vikings
        viking: {
          black: '#0A0A0A',
          dark: '#111111',
          darker: '#0D0D0D',
          gray: '#1A1A1A',
          'gray-mid': '#2A2A2A',
          'gray-light': '#3A3A3A',
          gold: '#C9A84C',
          'gold-light': '#E8C56A',
          'gold-dark': '#A8893A',
          red: '#8B0000',
          'red-light': '#A50000',
          'red-dark': '#6B0000',
          'text-primary': '#F5F0E8',
          'text-secondary': '#B0A898',
          'text-muted': '#6B6560',
        },
      },
      fontFamily: {
        viking: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C56A 50%, #A8893A 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(201, 168, 76, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(201, 168, 76, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        gold: '0 0 20px rgba(201, 168, 76, 0.4)',
        'gold-lg': '0 0 40px rgba(201, 168, 76, 0.6)',
        dark: '0 4px 30px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 8px 60px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
};
