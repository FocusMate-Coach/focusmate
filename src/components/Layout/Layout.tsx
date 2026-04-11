import { NavLink } from 'react-router-dom';
import { Timer, BarChart2, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          icon: Timer,    label: '타이머' },
  { to: '/dashboard', icon: BarChart2, label: '대시보드' },
  { to: '/feedback',  icon: Sparkles,  label: 'AI 피드백' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col lg:flex-row">
      {/* 사이드바 (데스크탑) */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-950 border-r border-slate-800 p-6 shrink-0">
        {/* 로고 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">
            <span className="text-purple-400">Focus</span>Mate
          </h1>
          <p className="text-xs text-slate-500 mt-1">AI 학습 코치</p>
        </div>

        {/* 네비게이션 */}
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* 하단 정보 */}
        <div className="text-xs text-slate-600 mt-4">
          <p>공모전 출품작 MVP v1.0</p>
          <p className="mt-1">Powered by OpenAI</p>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* 헤더 (모바일) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-slate-950 border-b border-slate-800">
          <h1 className="text-lg font-bold">
            <span className="text-purple-400">Focus</span>Mate
          </h1>
        </header>

        {/* 페이지 콘텐츠 */}
        <div className="flex-1 p-4 lg:p-8 max-w-4xl w-full mx-auto">
          {children}
        </div>

        {/* 하단 탭바 (모바일) */}
        <nav className="lg:hidden flex border-t border-slate-800 bg-slate-950">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
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
