// src/components/Timer/Timer.tsx
import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Target, Flame } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import FocusRating from '../FocusRating/FocusRating';
import type { Subject, StudyType, StudySession } from '../../types';

const SUBJECTS: Subject[] = ['국어', '영어', '수학', '과학', '사회', '기타'];
const STUDY_TYPES: StudyType[] = ['개념학습', '문제풀이', '복습', '인강시청', '오답노트'];

interface TimerProps {
  onSessionSaved: (session: StudySession) => void;
}

// 개별 시간(시, 분, 초)을 표시하는 미래형 플립 카드 컴포넌트
const TimeCard = ({ value, label, isActive }: { value: string, label: string, isActive: boolean }) => (
  <div className="flex flex-col items-center gap-3">
    <div className={`relative overflow-hidden rounded-[2rem] bg-slate-900 border transition-all duration-500 w-28 h-36 sm:w-36 sm:h-48 flex items-center justify-center ${isActive ? 'border-focusgreen-500/50 shadow-[0_0_40px_rgba(173,251,16,0.25)]' : 'border-white/5 shadow-2xl'}`}>
      {/* 플립 시계 중앙 가로선 (물리적인 시계 느낌) */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#020617] z-10 -translate-y-1/2 opacity-80 shadow-sm"></div>
      
      {/* 숫자 텍스트 */}
      <span className={`text-6xl sm:text-8xl font-black tabular-nums tracking-tighter z-0 transition-colors duration-500 ${isActive ? 'text-focusgreen-400 drop-shadow-focus-neon' : 'text-slate-200'}`}>
        {value}
      </span>
      
      {/* 반사되는 유리 질감 효과 */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
    </div>
    <span className={`text-xs sm:text-sm font-black tracking-[0.3em] uppercase ${isActive ? 'text-focusgreen-500/80' : 'text-slate-600'}`}>{label}</span>
  </div>
);

export default function Timer({ onSessionSaved }: TimerProps) {
  // 팀장님의 완벽한 코어 로직 100% 유지!
  const { status, elapsed, subject, studyType, startTime, setSubject, setStudyType, start, pause, resume, stop, reset } = useTimer();
  const [showRating, setShowRating] = useState(false);
  const [pendingSession, setPendingSession] = useState<Omit<StudySession, 'focusScore'> | null>(null);

  const handleStop = () => {
    if (elapsed < 5) return;
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

  // 시간을 시간, 분, 초 단위로 분리
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const isActive = status === 'running';

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-12 sm:gap-16 max-w-4xl mx-auto py-8">
      
      {/* 1. 상단: 플로팅 글래스 콤보박스 (과목/유형) */}
      <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-6 px-4 animate-fade-in-up">
        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-focusgreen-500 to-emerald-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex items-center">
            <div className="p-3 bg-slate-800 rounded-2xl text-focusgreen-400 mr-3">
              <Target size={20} />
            </div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              disabled={status !== 'idle'}
              className="flex-1 bg-transparent text-white text-lg font-bold focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
            >
              {SUBJECTS.map((s) => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-focusgreen-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex items-center">
            <div className="p-3 bg-slate-800 rounded-2xl text-emerald-400 mr-3">
              <Flame size={20} />
            </div>
            <select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value as StudyType)}
              disabled={status !== 'idle'}
              className="flex-1 bg-transparent text-white text-lg font-bold focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
            >
              {STUDY_TYPES.map((t) => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. 중앙: 파격적인 미래형 플립 클락 */}
      <div className="flex items-center gap-2 sm:gap-6 animate-fade-in-up mt-4">
        <TimeCard value={pad(h)} label="Hours" isActive={isActive && h > 0} />
        <span className={`text-4xl sm:text-6xl font-black pb-8 ${isActive ? 'text-focusgreen-400 animate-pulse' : 'text-slate-700'}`}>:</span>
        <TimeCard value={pad(m)} label="Minutes" isActive={isActive} />
        <span className={`text-4xl sm:text-6xl font-black pb-8 ${isActive ? 'text-focusgreen-400 animate-pulse' : 'text-slate-700'}`}>:</span>
        <TimeCard value={pad(s)} label="Seconds" isActive={isActive} />
      </div>

      {/* 최소 시간 안내 */}
      <div className="h-6">
        {status === 'running' && elapsed < 5 && (
          <p className="text-sm font-bold text-focusgreen-500/80 animate-pulse bg-focusgreen-500/10 px-4 py-1.5 rounded-full border border-focusgreen-500/20">
            데이터 수집을 위해 최소 5초 이상 집중해 주세요
          </p>
        )}
      </div>

      {/* 3. 하단: 사이버펑크 스타일 컨트롤 센터 */}
      <div className="flex items-center gap-6 sm:gap-10 animate-fade-in-up mt-2">
        {/* 종료 버튼 */}
        {(status === 'running' || status === 'paused') ? (
          <button
            onClick={handleStop}
            className="p-5 sm:p-6 rounded-[2rem] bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300 active:scale-90 group"
            title="종료 및 저장"
          >
            <Square size={28} className="group-hover:scale-110 transition-transform" fill="currentColor" />
          </button>
        ) : (
          <div className="p-5 sm:p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 text-slate-700 opacity-50">
            <Square size={28} fill="currentColor" />
          </div>
        )}

        {/* 메인 액션 버튼 (네온 글로우) */}
        <button
          onClick={status === 'idle' ? start : (isActive ? pause : resume)}
          className={`relative group p-8 sm:p-10 rounded-[2.5rem] transition-all duration-500 active:scale-95 flex items-center justify-center ${
            isActive 
            ? 'bg-slate-900 border border-white/10 text-white hover:bg-slate-800' 
            : 'bg-focusgreen-500 text-slate-950 shadow-[0_0_40px_rgba(173,251,16,0.5)] hover:shadow-[0_0_60px_rgba(173,251,16,0.7)] hover:bg-focusgreen-400'
          }`}
        >
          {isActive ? (
            <Pause size={56} fill="currentColor" className="drop-shadow-lg" />
          ) : (
            <Play size={56} className="ml-3 drop-shadow-lg" fill="currentColor" />
          )}
        </button>

        {/* 초기화 버튼 */}
        {(status === 'running' || status === 'paused') ? (
          <button
            onClick={reset}
            className="p-5 sm:p-6 rounded-[2rem] bg-slate-900/80 border border-white/5 text-slate-400 hover:text-slate-950 hover:bg-slate-200 transition-all duration-300 active:scale-90 group"
            title="초기화"
          >
            <RotateCcw size={28} className="group-hover:-rotate-180 transition-transform duration-500" />
          </button>
        ) : (
          <div className="p-5 sm:p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 text-slate-700 opacity-50">
            <RotateCcw size={28} />
          </div>
        )}
      </div>

      {/* 팀장님의 집중도 평가 모달은 그대로 유지! */}
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