// src/components/Layout/Layout.tsx
import { NavLink } from 'react-router-dom';
import { Timer, BarChart2, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          icon: Timer,    label: 'Timer' },
  { to: '/dashboard', icon: BarChart2, label: 'Analytics' },
  { to: '/feedback',  icon: Sparkles,  label: 'AI Coach' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-slate-800 font-sans selection:bg-indigo-100 overflow-hidden relative flex flex-col">
      {/* 밝고 부드러운 파스텔 배경 글로우 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/40 rounded-full blur-[100px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-sky-200/40 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* 상단 플로팅 네비게이션 (라이트 톤 글래스모피즘) */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
        <nav className="flex items-center gap-2 px-3 py-2.5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-full shadow-soft">
          {/* 미니 로고 */}
          <div className="px-4 py-1 border-r border-slate-200 mr-2 flex items-center">
            <Sparkles size={18} className="text-indigo-500 mr-2" />
            <span className="font-extrabold tracking-tight text-sm text-slate-800">Focus</span>
          </div>
          
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-glow'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={16}  />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* 풀스크린 메인 콘텐츠 (여백 극대화) */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full pt-24 pb-20">
        <div className="w-full max-w-5xl mx-auto px-6 h-full flex flex-col justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}