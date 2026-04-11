// src/components/Timer/Timer.tsx
import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Target, Flame, Trophy } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import FocusRating from '../FocusRating/FocusRating';
import type { Subject, StudyType, StudySession } from '../../types';

const SUBJECTS: Subject[] = ['국어', '영어', '수학', '과학', '사회', '기타'];
const STUDY_TYPES: StudyType[] = ['개념학습', '문제풀이', '복습', '인강시청', '오답노트'];

interface TimerProps {
  onSessionSaved: (session: StudySession) => void;
}

export default function Timer({ onSessionSaved }: TimerProps) {
  // 팀장님의 핵심 타이머 로직 그대로 유지!
  const { status, elapsed, subject, studyType, startTime, setSubject, setStudyType, start, pause, resume, stop, reset } = useTimer();
  const [showRating, setShowRating] = useState(false);
  const [pendingSession, setPendingSession] = useState<Omit<StudySession, 'focusScore'> | null>(null);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (elapsed < 5) return; // 최소 5초 이상
    stop();

    const now = new Date();
    const endH = String(now.getHours()).padStart(2, '0');
    const endM = String(now.getMinutes()).padStart(2, '0');
    const hour = parseInt(startTime.split(':')[0], 10) || 0;

    setPendingSession({
      id: `session_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      startTime,
      endTime: `${endH}:${endM}`,
      hour,
      subject,
      studyType,
      duration: elapsed,
      createdAt: Date.now(),
    });
    setShowRating(true);
  };

  const handleRatingSave = (score: number) => {
    if (!pendingSession) return;
    const session: StudySession = { ...pendingSession, focusScore: score };
    onSessionSaved(session);
    setShowRating(false);
    setPendingSession(null);
    reset();
  };

  const handleRatingCancel = () => {
    setShowRating(false);
    setPendingSession(null);
    reset();
  };

  const isActive = status === 'running';

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-10 max-w-2xl mx-auto">
      
      {/* 과목 및 학습 유형 선택 (글래스모피즘 디자인 적용) */}
      <div className="w-full flex gap-4 animate-fade-in-up px-4">
        <div className="flex-1">
          <label className="block text-xs text-teal-400/80 mb-2 font-bold uppercase tracking-wider ml-1">과목</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            disabled={status !== 'idle'}
            className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-teal-400/80 mb-2 font-bold uppercase tracking-wider ml-1">학습 유형</label>
          <select
            value={studyType}
            onChange={(e) => setStudyType(e.target.value as StudyType)}
            disabled={status !== 'idle'}
            className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {STUDY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 상단 상태 뱃지 */}
      <div className="flex gap-4 animate-fade-in-up">
        <div className="bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
          <Target className="text-teal-400" size={16} />
          <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">{subject}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
          <Flame className="text-emerald-400" size={16} />
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">{studyType}</span>
        </div>
      </div>

      {/* 메인 원형 스톱워치 디자인 */}
      <div className="relative group animate-fade-in-up">
        {/* 외부 글로우 효과 */}
        <div className={`absolute inset-0 bg-teal-500/20 rounded-full blur-[60px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
        
        <div className="relative w-80 h-80 flex items-center justify-center bg-slate-900/40 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl">
          {/* 원형 프로그레스 바 (SVG) */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle cx="160" cy="160" r="140" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
            <circle
              cx="160" cy="160" r="140" fill="transparent"
              stroke="url(#tealGradient)"
              strokeWidth="12"
              strokeDasharray="880"
              strokeDashoffset={880 - (elapsed % 3600 / 3600) * 880}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>

          {/* 시간 표시 */}
          <div className="text-center z-10">
            <div className="text-6xl font-black text-white tracking-tighter font-mono tabular-nums drop-shadow-2xl">
              {formatTime(elapsed)}
            </div>
            <p className="text-slate-500 font-bold text-sm mt-3 tracking-[0.3em] uppercase">
              {status === 'running' ? 'Deep Work' : status === 'paused' ? 'Paused' : 'Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* 최소 시간 안내 */}
      <div className="h-4">
        {status === 'running' && elapsed < 5 && (
          <p className="text-xs text-slate-500 font-medium animate-pulse">5초 이상 공부해야 세션을 저장할 수 있어요</p>
        )}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center gap-8 animate-fade-in-up">
        {/* 정지 및 저장 버튼 */}
        {(status === 'running' || status === 'paused') ? (
          <button
            onClick={handleStop}
            className="p-5 rounded-3xl bg-slate-800/50 border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
            title="종료 및 저장"
          >
            <Square size={28} fill="currentColor" />
          </button>
        ) : (
          <button disabled className="p-5 rounded-3xl bg-slate-800/20 border border-white/5 text-slate-600 opacity-50 cursor-not-allowed">
            <Square size={28} fill="currentColor" />
          </button>
        )}

        {/* 중앙 메인 재생/일시정지 버튼 */}
        <button
          onClick={status === 'idle' ? start : (isActive ? pause : resume)}
          className={`p-10 rounded-[40px] transition-all duration-500 active:scale-95 shadow-2xl flex items-center justify-center ${
            isActive 
            ? 'bg-slate-800/80 text-white border border-white/10 hover:shadow-white/5' 
            : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:shadow-[0_0_40px_rgba(20,184,166,0.6)]'
          }`}
        >
          {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} className="ml-2" fill="currentColor" />}
        </button>

        {/* 리셋 버튼 */}
        {(status === 'running' || status === 'paused') ? (
          <button
            onClick={reset}
            className="p-5 rounded-3xl bg-slate-800/50 border border-white/5 text-slate-500 hover:text-white hover:bg-slate-700 transition-all active:scale-90"
            title="초기화"
          >
            <RotateCcw size={28} />
          </button>
        ) : (
          <div className="p-5 rounded-3xl bg-slate-800/20 border border-white/5 text-slate-600 opacity-50">
            <Trophy size={28} />
          </div>
        )}
      </div>

      {/* 집중도 평가 모달 */}
      {showRating && (
        <FocusRating
          subject={subject}
          studyType={studyType}
          duration={elapsed}
          onSave={handleRatingSave}
          onCancel={handleRatingCancel}
        />
      )}
    </div>
  );
}