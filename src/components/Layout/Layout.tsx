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
    // 🎨 수정: 두 번째 사진의 따뜻한 크림색(#F2EAE0) 배경 복구
    <div className="min-h-screen bg-[#F2EAE0] text-slate-800 font-sans selection:bg-[#BDA6CE]/40 overflow-hidden relative flex flex-col">
      
      {/* 부드러운 민트 & 퍼플 배경 글로우 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#B4D3D9]/40 rounded-full blur-[100px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#BDA6CE]/30 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* 📱 반응형 네비게이션: 모바일은 하단(bottom-0), PC는 상단(top-6) */}
      <header className="fixed bottom-0 sm:bottom-auto sm:top-6 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-auto z-50">
        {/* 🎨 수정: 유리 질감 바탕에 퍼플 테두리 적용 */}
        <nav className="flex items-center justify-around sm:justify-start gap-1 sm:gap-2 px-2 sm:px-3 py-3 sm:py-2.5 bg-white/80 backdrop-blur-xl border-t sm:border border-[#BDA6CE]/30 sm:rounded-full shadow-2xl sm:shadow-sm pb-[env(safe-area-inset-bottom,1rem)] sm:pb-2.5">
          
          {/* PC에서만 보이는 좌측 로고 */}
          <div className="hidden sm:flex px-4 py-1 border-r border-[#BDA6CE]/30 mr-2 items-center">
            <Sparkles size={18} className="text-[#9B8EC7] mr-2" />
            <span className="font-extrabold tracking-tight text-sm text-slate-800">Focus</span>
          </div>
          
          {/* 메뉴 아이템 */}
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2 rounded-2xl sm:rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-[#9B8EC7] text-white shadow-[0_0_20px_rgba(155,142,199,0.4)]'
                    : 'text-slate-500 hover:text-[#9B8EC7] hover:bg-white/50'
                }`
              }
            >
              <Icon size={20} className="sm:w-4 sm:h-4"  />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* 🖥️ 메인 콘텐츠 영역 (모바일 하단 바에 가리지 않게 pb-28 설정) */}
      <main className="flex-1 flex flex-col relative z-10 w-full h-full pt-8 sm:pt-28 pb-28 sm:pb-20 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}