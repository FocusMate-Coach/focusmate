// src/components/Timer/Timer.tsx
import { useState } from 'react';
import { Play, Pause, Square, Target, ChevronDown } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import FocusRating from '../FocusRating/FocusRating';
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

  const handleRatingCancel = () => {
    setShowRating(false); setPendingSession(null); reset();
  };

  const time = formatTime(elapsed);
  const isActive = status === 'running';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] animate-fade-in-up">
      
      <div className="flex-1"></div>

      {/* 2. 중앙: 딥 퍼플 색상의 반응형 타이머 텍스트 */}
      <div className="flex flex-col items-center justify-center w-full z-10 px-4">
        <div className={`text-[18vw] sm:text-8xl md:text-[9rem] lg:text-[11rem] font-black leading-none tracking-tighter tabular-nums transition-colors duration-1000 drop-shadow-sm flex items-baseline justify-center ${isActive ? 'text-palette-3' : 'text-palette-2/60'}`}>
          <span>{time.h}</span>
          <span className={`mx-1 sm:mx-2 ${isActive ? 'opacity-50 animate-pulse' : 'opacity-40'}`}>:</span>
          <span>{time.m}</span>
          <span className="text-[9vw] sm:text-6xl md:text-7xl lg:text-8xl opacity-60 font-semibold ml-1 sm:ml-2">
            :{time.s}
          </span>
        </div>
        
        <p className={`mt-6 tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-sm uppercase font-extrabold transition-colors duration-1000 px-6 py-2 rounded-full ${isActive ? 'bg-palette-2/20 text-palette-3' : 'bg-palette-0 text-palette-2'}`}>
          {status === 'running' ? 'Deep Work in Progress' : 'Ready to Focus'}
        </p>
      </div>

      {/* 3. 하단 여백 및 독(Dock) 래퍼 */}
      <div className="flex-1 flex flex-col justify-end items-center w-full mt-10 sm:mt-16 pb-8 z-40">
        <div className="flex flex-col items-center gap-3">
          
          <div className="h-4">
            {status === 'running' && elapsed < 5 && (
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest bg-rose-100/50 px-3 py-1 rounded-full border border-rose-200">
                Minimum 5s required
              </span>
            )}
          </div>

          {/* 독(Dock) 컨테이너 */}
          <div className="bg-white/80 backdrop-blur-xl border border-palette-2/40 rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-3 flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-4 shadow-soft transition-all duration-500 hover:shadow-lg hover:bg-white max-w-[95vw]">
            
            {/* 설정: 과목 및 유형 (크림색 배경) */}
            <div className="flex items-center bg-palette-0/80 rounded-[1.5rem] sm:rounded-[2rem] p-2 pl-3 sm:pl-4 pr-2 sm:pr-3 border border-palette-2/30 gap-2 sm:gap-3">
              <Target size={16} className="text-palette-3 hidden xs:block" />
              <select 
                value={subject || ''} 
                onChange={(e) => setSubject(e.target.value as Subject)} 
                disabled={status !== 'idle'} 
                className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold focus:outline-none appearance-none cursor-pointer max-w-[70px] sm:max-w-none text-center sm:text-left disabled:opacity-50"
              >
                {SUBJECTS.map((s) => <option key={s} value={s} className="bg-white">{s}</option>)}
              </select>
              <span className="text-palette-2">|</span>
              <select 
                value={studyType || ''} 
                onChange={(e) => setStudyType(e.target.value as StudyType)} 
                disabled={status !== 'idle'} 
                className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold focus:outline-none appearance-none cursor-pointer max-w-[80px] sm:max-w-none text-center sm:text-left disabled:opacity-50"
              >
                {STUDY_TYPES.map((t) => <option key={t} value={t} className="bg-white">{t}</option>)}
              </select>
              <ChevronDown size={14} className="text-palette-3/70 ml-0.5 sm:ml-1" />
            </div>

            {/* 메인 컨트롤 버튼들 */}
            <div className="flex items-center gap-2 pl-1 pr-1">
              <button
                onClick={status === 'idle' ? start : (isActive ? pause : resume)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-sm ${
                  isActive 
                  ? 'bg-palette-1/30 text-palette-3 border border-palette-1/50 hover:bg-palette-1/50' 
                  : 'bg-palette-3 text-white hover:scale-105 shadow-[0_0_20px_rgba(155,142,199,0.4)] hover:bg-[#8A7CB3]'
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
        <FocusRating subject={subject} studyType={studyType} duration={elapsed} onSave={handleRatingSave} onCancel={handleRatingCancel} />
      )}
    </div>
  );
}