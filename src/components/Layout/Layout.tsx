// src/components/Layout/Layout.tsx
import { NavLink } from 'react-router-dom';
import { Timer, BarChart2, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          icon: Timer,    label: '학습 타이머' },
  { to: '/dashboard', icon: BarChart2, label: '데이터 분석' },
  { to: '/feedback',  icon: Sparkles,  label: 'AI 코칭' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 flex flex-col lg:flex-row font-sans selection:bg-purple-500/30 overflow-hidden relative">
      {/* 배경 장식 */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* 사이드바 */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 shrink-0 z-10">
        <div className="mb-10">
          <h1 className="text-2xl font-black tracking-tight italic flex items-center gap-2">
            <Sparkles className="text-purple-500" size={24} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Focus
            </span>
            <span className="text-white">Mate</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 ml-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-[10px] tracking-widest text-slate-400 font-medium uppercase">AI Engine Active</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 text-[10px] mt-4">
          <p className="text-slate-400 font-medium mb-1">MVP Version 1.0</p>
          <p className="text-indigo-400/70 font-bold">Powered by Advanced AI</p>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        <header className="lg:hidden flex items-center justify-between px-6 py-5 bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            <span className="text-purple-400">Focus</span>Mate
          </h1>
        </header>

        <div className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto animate-fade-in-up">
          {children}
        </div>

        {/* 모바일 하단 탭바 (이 부분 에러 수정 완료!) */}
        <nav className="lg:hidden flex border-t border-white/5 bg-slate-900/80 backdrop-blur-xl pb-safe">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-4 text-[11px] font-medium transition-all ${
                  isActive ? 'text-purple-400' : 'text-slate-500'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}