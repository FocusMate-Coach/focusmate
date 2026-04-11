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
    <div className="min-h-screen bg-space text-white font-sans selection:bg-purple-500/30 overflow-hidden relative flex flex-col">
      {/* 백그라운드 오로라 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-violet-900/20 rounded-full blur-[150px] mix-blend-screen animate-aurora-1 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-cyan-900/20 rounded-full blur-[150px] mix-blend-screen animate-aurora-2 pointer-events-none"></div>

      {/* 구조 변경 1: 상단 플로팅 네비게이션 (데스크탑 & 모바일 공통) */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
        <nav className="flex items-center gap-2 px-3 py-2.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
          {/* 미니 로고 */}
          <div className="px-4 py-1 border-r border-white/10 mr-2">
            <Sparkles size={18} className="text-violet-400 inline-block mr-2" />
            <span className="font-bold tracking-tight text-sm">Focus</span>
          </div>
          
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-500 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* 구조 변경 2: 풀스크린 메인 콘텐츠 (여백 극대화) */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full pt-24 pb-20">
        <div className="w-full max-w-5xl mx-auto px-6 h-full flex flex-col justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}