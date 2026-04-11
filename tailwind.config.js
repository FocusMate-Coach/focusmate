/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: '#030712', // 완전한 깊은 어둠
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'aurora-1': 'aurora 15s ease infinite alternate',
        'aurora-2': 'aurora 20s ease-in-out infinite alternate-reverse',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '100%': { transform: 'translate(50px, -50px) scale(1.3) rotate(10deg)' },
        }
      }
    },
  },
  plugins: [],
}