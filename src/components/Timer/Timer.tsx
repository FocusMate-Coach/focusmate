// src/components/Timer/Timer.tsx
import { useState } from 'react';
import { Play, Pause, Square, Target, ChevronDown } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import FocusRating from '../FocusRating/FocusRating'; // <- 누락되었던 에러 해결!
import type { Subject, StudyType, StudySession } from '../../types';

const SUBJECTS: Subject[] = ['국어', '영어', '수학', '과학', '사회', '기타'];
const STUDY_TYPES: StudyType[] = ['개념학습', '문제풀이', '복습', '인강시청', '오답노트'];

interface TimerProps {
  onSessionSaved: (session: StudySession) => void;
}

export default function Timer({ onSessionSaved }: TimerProps) {
  const { status, elapsed, subject, studyType, startTime, setSubject, setStudyType, start, pause, resume, stop, reset } = useTimer();
  const [showRating, setShowRating] = useState(false);
  const [pendingSession, setPendingSession] = useState<Omit<StudySession, 'focusScore'> | null>(null);

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
      subject, studyType, duration: elapsed, createdAt: Date.now(),
    });
    setShowRating(true);
  };

  const handleRatingSave = (score: number) => {
    if (pendingSession) onSessionSaved({ ...pendingSession, focusScore: score });
    setShowRating(false); setPendingSession(null); reset();
  };

  // 👇 아까 누락되었던 에러의 원인! 완벽하게 추가되었습니다.
  const handleRatingCancel = () => {
    setShowRating(false); 
    setPendingSession(null); 
    reset();
  };

  const time = formatTime(elapsed);
  const isActive = status === 'running';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full animate-fade-in-up">
      
      {/* 1. 중앙: 극도로 단순화된 풀스크린 시계 (Thin 폰트 사용) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
        <div className={`text-[5rem] sm:text-[10rem] md:text-[13rem] font-light leading-none tracking-tighter tabular-nums transition-all duration-1000 ${isActive ? 'text-white' : 'text-slate-500/50'}`}>
          {time.h}<span className={`${isActive ? 'opacity-50 animate-pulse' : 'opacity-20'}`}>:</span>{time.m}<span className="text-5xl sm:text-7xl md:text-8xl opacity-50 font-normal">:{time.s}</span>
        </div>
        <p className={`mt-4 tracking-[0.5em] text-xs sm:text-sm uppercase font-semibold transition-colors duration-1000 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
          {status === 'running' ? 'Deep Work in Progress' : 'Ready to Focus'}
        </p>
      </div>

      {/* 2. 하단: 플로팅 독 (Dock) - 과목 선택과 컨트롤러를 통합 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
        <div className="flex flex-col items-center gap-4">
          
          {/* 최소 시간 경고 (자연스럽게 떠오름) */}
          <div className="h-4">
            {status === 'running' && elapsed < 5 && (
              <span className="text-[10px] text-violet-300/70 uppercase tracking-widest bg-violet-900/30 px-3 py-1 rounded-full border border-violet-500/20">
                Minimum 5s required
              </span>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 flex items-center gap-3 shadow-2xl transition-all duration-500 hover:bg-white/10">
            
            {/* 설정: 과목 및 유형 (미니멀 콤보박스) */}
            <div className="flex items-center bg-black/40 rounded-[1.5rem] p-2 pl-4 pr-2 border border-white/5 gap-3">
              <Target size={18} className="text-violet-400" />
              <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} disabled={status !== 'idle'} className="bg-transparent text-white text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
                {SUBJECTS.map((s) => <option key={s} value={s} className="bg-space">{s}</option>)}
              </select>
              <span className="text-slate-600">|</span>
              <select value={studyType} onChange={(e) => setStudyType(e.target.value as StudyType)} disabled={status !== 'idle'} className="bg-transparent text-white text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
                {STUDY_TYPES.map((t) => <option key={t} value={t} className="bg-space">{t}</option>)}
              </select>
              <ChevronDown size={14} className="text-slate-500 ml-1" />
            </div>

            {/* 메인 컨트롤 버튼들 */}
            <div className="flex items-center gap-2 pl-2">
              <button
                onClick={status === 'idle' ? start : (isActive ? pause : resume)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                  isActive 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                }`}
              >
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
              
              {(status === 'running' || status === 'paused') && (
                <button onClick={handleStop} className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-90" title="Stop">
                  <Square size={20} fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRating && (
        <FocusRating subject={subject} studyType={studyType} duration={elapsed} onSave={handleRatingSave} onCancel={handleRatingCancel} />
      )}
    </div>
  );
}