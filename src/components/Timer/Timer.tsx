// src/components/Timer/Timer.tsx
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Target, ChevronDown, Check } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import FocusRating from '../FocusRating/FocusRating';
import type { StudyType, StudySession } from '../../types';

// 💡 [수정] '기타' 항목이 배열 맨 끝에 추가되었습니다.
const STUDY_TYPES = ['개념학습', '문제풀이', '복습', '인강시청', '오답노트', '기타'] as StudyType[];

interface TimerProps {
  onSessionSaved: (session: StudySession) => void;
}

export default function Timer({ onSessionSaved }: TimerProps) {
  const { status, elapsed, subject, studyType, startTime, setStudyType, start, pause, resume, stop, reset } = useTimer();
  const [showRating, setShowRating] = useState(false);
  const [pendingSession, setPendingSession] = useState<Omit<StudySession, 'focusScore'> | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const handleStop = () => {
    if (elapsed < 5) return;
    stop();
    const now = new Date();
    setPendingSession({
      id: `session_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      startTime,
      endTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      hour: parseInt(startTime.split(':')[0], 10) || 0,
      subject: subject || '기타',
      studyType,
      duration: elapsed,
      createdAt: Date.now(),
    });
    setShowRating(true);
  };

  const handleRatingSave = (score: number) => {
    if (pendingSession) onSessionSaved({ ...pendingSession, focusScore: score });
    setShowRating(false); setPendingSession(null); reset();
  };

  const handleRatingCancel = () => {
    setShowRating(false); setPendingSession(null); reset();
  };

  const time = formatTime(elapsed);
  const isActive = status === 'running';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] animate-fade-in-up selection:bg-[#BDA6CE]/20">
      
      <div className="flex-1"></div>

      {/* 중앙: 타이머 텍스트 */}
      <div className="flex flex-col items-center justify-center w-full z-10 px-4">
        <div className={`text-[18vw] sm:text-8xl md:text-[9rem] lg:text-[11rem] font-black leading-none tracking-tighter tabular-nums transition-colors duration-1000 drop-shadow-sm flex items-baseline justify-center ${isActive ? 'text-[#9B8EC7]' : 'text-[#BDA6CE]/60'}`}>
          <span>{time.h}</span>
          <span className={`mx-1 sm:mx-2 ${isActive ? 'opacity-50 animate-pulse' : 'opacity-40'}`}>:</span>
          <span>{time.m}</span>
          <span className="text-[9vw] sm:text-6xl md:text-7xl lg:text-8xl opacity-60 font-semibold ml-1 sm:ml-2">
            :{time.s}
          </span>
        </div>
        
        <p className={`mt-6 tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-sm uppercase font-extrabold transition-colors duration-1000 px-6 py-2 rounded-full ${isActive ? 'bg-[#BDA6CE]/20 text-[#9B8EC7]' : 'bg-[#F2EAE0] text-[#BDA6CE]'}`}>
          {status === 'running' ? 'Deep Work in Progress' : 'Ready to Focus'}
        </p>
      </div>

      {/* 하단 독(Dock) 래퍼 */}
      <div className="flex-1 flex flex-col justify-end items-center w-full mt-10 sm:mt-16 pb-8 z-40">
        <div className="flex flex-col items-center gap-3 relative">
          
          <div className="h-4">
            {status === 'running' && elapsed < 5 && (
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest bg-rose-100/50 px-3 py-1 rounded-full border border-rose-200">
                Minimum 5s required
              </span>
            )}
          </div>

          {/* 독(Dock) 컨테이너 */}
          <div className="bg-white/80 backdrop-blur-xl border border-[#BDA6CE]/40 rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-3 flex items-center justify-center gap-3 sm:gap-4 shadow-sm transition-all duration-500 hover:shadow-md hover:bg-white max-w-[95vw]">
            
            {/* 커스텀 드롭다운 트리거 버튼 */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => status === 'idle' && setIsMenuOpen(!isMenuOpen)}
                disabled={status !== 'idle'}
                className={`flex items-center bg-[#F2EAE0]/80 rounded-[1.5rem] sm:rounded-[2rem] p-2.5 px-4 sm:px-5 border transition-all duration-300 gap-2 sm:gap-3 ${status === 'idle' ? 'border-[#BDA6CE]/40 hover:bg-[#F2EAE0]' : 'border-transparent opacity-60'}`}
              >
                <Target size={16} className="text-[#9B8EC7] hidden xs:block" />
                <span className="text-slate-800 text-sm sm:text-base font-extrabold">
                  {studyType || '분류 선택'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ml-0.5 sm:ml-1 ${isMenuOpen ? 'rotate-180' : ''} ${status === 'idle' ? 'text-[#9B8EC7]/70' : 'text-slate-400'}`} />
              </button>

              {/* 커스텀 드롭다운 메뉴 */}
              {isMenuOpen && status === 'idle' && (
                <div className="absolute bottom-[calc(100%+10px)] left-0 w-full min-w-[140px] bg-white/90 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-3xl p-3 shadow-2xl z-[100] animate-fade-in-down origin-bottom">
                  <p className="text-[11px] font-bold text-slate-400 px-3 pb-2 tracking-widest uppercase">학습 목표</p>
                  <div className="flex flex-col gap-1.5">
                    {STUDY_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setStudyType(t);
                          setIsMenuOpen(false);
                        }}
                        className={`group flex items-center justify-between gap-3 w-full p-3 px-4 rounded-xl text-sm transition-colors duration-200 ${
                          studyType === t
                            ? 'bg-[#9B8EC7] text-white font-black'
                            : 'text-slate-700 font-bold hover:bg-[#BDA6CE]/20 hover:text-[#9B8EC7]'
                        }`}
                      >
                        <span>{t}</span>
                        {studyType === t && <Check size={16} className="text-white shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 메인 컨트롤 버튼들 */}
            <div className="flex items-center gap-2 pl-1 pr-1">
              <button
                onClick={status === 'idle' ? start : (isActive ? pause : resume)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm ${
                  isActive 
                  ? 'bg-[#B4D3D9]/30 text-[#9B8EC7] border border-[#B4D3D9]/50 hover:bg-[#B4D3D9]/50' 
                  : 'bg-[#9B8EC7] text-white hover:scale-105 shadow-[0_0_20px_rgba(155,142,199,0.4)] hover:bg-[#8A7CB3]'
                }`}
              >
                {isActive ? <Pause size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> : <Play size={20} className="ml-1 sm:w-6 sm:h-6" fill="currentColor" />}
              </button>
              
              {(status === 'running' || status === 'paused') && (
                <button onClick={handleStop} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-rose-50/80 text-rose-400 hover:bg-rose-400 hover:text-white transition-all duration-300 active:scale-90 border border-rose-100" title="Stop">
                  <Square size={16} className="sm:w-5 sm:h-5" fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRating && (
        <FocusRating subject={subject || '기타'} studyType={studyType} duration={elapsed} onSave={handleRatingSave} onCancel={handleRatingCancel} />
      )}
    </div>
  );
}