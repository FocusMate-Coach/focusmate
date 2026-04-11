import { useState } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import FocusRating from '../FocusRating/FocusRating';
import type { Subject, StudyType, StudySession } from '../../types';

const SUBJECTS: Subject[] = ['국어', '영어', '수학', '과학', '사회', '기타'];
const STUDY_TYPES: StudyType[] = ['개념학습', '문제풀이', '복습', '인강시청', '오답노트'];

const SUBJECT_COLORS: Record<Subject, string> = {
  '국어': 'bg-emerald-500',
  '영어': 'bg-blue-500',
  '수학': 'bg-purple-500',
  '과학': 'bg-amber-500',
  '사회': 'bg-red-500',
  '기타': 'bg-gray-500',
};

interface TimerProps {
  onSessionSaved: (session: StudySession) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function Timer({ onSessionSaved }: TimerProps) {
  const { status, elapsed, subject, studyType, startTime, setSubject, setStudyType, start, pause, resume, stop, reset } = useTimer();
  const [showRating, setShowRating] = useState(false);
  const [pendingSession, setPendingSession] = useState<Omit<StudySession, 'focusScore'> | null>(null);

  const handleStop = () => {
    if (elapsed < 5) return; // 최소 5초 이상
    stop();

    const now = new Date();
    const endH = String(now.getHours()).padStart(2, '0');
    const endM = String(now.getMinutes()).padStart(2, '0');
    const hour = parseInt(startTime.split(':')[0], 10);

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

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 과목 / 유형 선택 */}
      <div className="w-full max-w-md flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">과목</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            disabled={status !== 'idle'}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">학습 유형</label>
          <select
            value={studyType}
            onChange={(e) => setStudyType(e.target.value as StudyType)}
            disabled={status !== 'idle'}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {STUDY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 현재 세션 배지 */}
      {status !== 'idle' && (
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${SUBJECT_COLORS[subject]} ${status === 'running' ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-slate-300">
            {subject} · {studyType}
          </span>
          {startTime && (
            <span className="text-sm text-slate-500">({startTime} 시작)</span>
          )}
        </div>
      )}

      {/* 타이머 디스플레이 */}
      <div className="relative">
        <div className="w-64 h-64 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-2xl">
          {status === 'running' && (
            <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-20" />
          )}
          <span className="text-5xl font-bold text-white font-mono tracking-wider">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center gap-4">
        {status === 'idle' && (
          <button
            onClick={start}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-semibold text-lg transition-all active:scale-95 shadow-lg shadow-purple-900/40"
          >
            <Play size={22} fill="currentColor" />
            시작
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              onClick={pause}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95"
            >
              <Pause size={20} fill="currentColor" />
              일시정지
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-slate-700 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95"
            >
              <Square size={20} fill="currentColor" />
              정지
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={resume}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95"
            >
              <Play size={20} fill="currentColor" />
              재개
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95"
            >
              <Square size={20} fill="currentColor" />
              종료
            </button>
          </>
        )}

        {(status === 'running' || status === 'paused') && (
          <button
            onClick={reset}
            className="text-slate-500 hover:text-slate-300 transition-colors p-2"
            title="초기화"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </div>

      {/* 최소 시간 안내 */}
      {status === 'running' && elapsed < 5 && (
        <p className="text-xs text-slate-500">5초 이상 공부해야 세션을 저장할 수 있어요</p>
      )}

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
