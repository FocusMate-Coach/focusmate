// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020617', // 아주 어두운 밤하늘색
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        focusgreen: {
          400: '#ADFB10', // 퓨어 네온 그린
          500: '#8CE015',
        }
      },
      fontFamily: {
        // 더 현대적이고 가독성 좋은 Pretendard 폰트를 메인으로 설정
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      // 물리적 플립 카드의 깊이감을 위한 특수 그림자 설정
      dropShadow: {
        'focus-neon': '0 0 20px rgba(173, 251, 16, 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}