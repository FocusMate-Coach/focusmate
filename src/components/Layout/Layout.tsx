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
    // 배경색을 아주 어두운 남색(#060B19)으로 변경하고 폰트를 Pretendard로 설정
    <div className="min-h-screen bg-[#060B19] text-slate-200 flex flex-col lg:flex-row font-sans selection:bg-focusgreen-500/30 overflow-hidden relative">
      {/* 프리미엄 배경 글로우 효과 (Teal & Blue) */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* 데스크탑 사이드바: 글래스모피즘 효과 적용 */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 p-7 shrink-0 z-10 shadow-2xl">
        <div className="mb-12">
          <h1 className="text-3xl font-black tracking-tighter italic flex items-center gap-2 drop-shadow-focus-neon">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-focusgreen-400 to-emerald-400">
              Focus
            </span>
            <span className="text-white">Mate</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 ml-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">AI Engine Active</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-focusgreen-500/10 to-emerald-500/10 text-focusgreen-400 border border-focusgreen-500/20 shadow-[0_0_20px_rgba(140,224,21,0.1)]'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon size={20}  />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-5 bg-slate-950/50 rounded-2xl border border-white/5 text-[11px] mt-4 shadow-inner">
          <p className="text-slate-400 font-semibold mb-1.5">MVP Version 1.0</p>
          <p className="text-focusgreen-400/70 font-black tracking-wide">Powered by Advanced AI</p>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        <header className="lg:hidden flex items-center justify-between px-6 py-5 bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <h1 className="text-xl font-black italic tracking-tighter drop-shadow-focus-neon">
            <span className="text-focusgreen-400">Focus</span>Mate
          </h1>
        </header>

        {/* 페이지 콘텐츠가 부드럽게 나타나도록 애니메이션 적용 */}
        <div className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto animate-fade-in-up">
          {children}
        </div>

        {/* 모바일 하단 탭바 (에러 수정 완료 버전) */}
        <nav className="lg:hidden flex border-t border-white/5 bg-slate-900/90 backdrop-blur-2xl pb-safe shadow-2xl">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1.5 py-4 text-[11px] font-bold transition-all ${
                  isActive ? 'text-focusgreen-400' : 'text-slate-500'
                }`
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}