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
        palette: {
          0: '#F2EAE0', // 따뜻한 크림 (배경)
          1: '#B4D3D9', // 파스텔 민트
          2: '#BDA6CE', // 파스텔 퍼플
          3: '#9B8EC7', // 딥 퍼플 (강조)
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 20px 40px -15px rgba(155, 142, 199, 0.15)',
        'glow': '0 0 25px rgba(155, 142, 199, 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}