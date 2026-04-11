import { useState } from 'react';
import type { Subject, StudyType } from '../../types';
import { formatDuration } from '../../utils/dataAnalysis';

interface FocusRatingProps {
  subject: Subject;
  studyType: StudyType;
  duration: number;
  onSave: (score: number) => void;
  onCancel: () => void;
}

const FOCUS_OPTIONS = [
  { score: 1, emoji: '😴', label: '집중 안됨', color: 'hover:bg-slate-700 hover:border-slate-500' },
  { score: 2, emoji: '😕', label: '조금 산만', color: 'hover:bg-red-900/40 hover:border-red-600' },
  { score: 3, emoji: '😐', label: '보통',     color: 'hover:bg-amber-900/40 hover:border-amber-500' },
  { score: 4, emoji: '😊', label: '집중 양호', color: 'hover:bg-blue-900/40 hover:border-blue-500' },
  { score: 5, emoji: '🔥', label: '완전 집중', color: 'hover:bg-purple-900/40 hover:border-purple-500' },
];

const SELECTED_COLORS: Record<number, string> = {
  1: 'bg-slate-700 border-slate-400',
  2: 'bg-red-900/60 border-red-500',
  3: 'bg-amber-900/60 border-amber-500',
  4: 'bg-blue-900/60 border-blue-500',
  5: 'bg-purple-900/60 border-purple-500',
};

export default function FocusRating({ subject, studyType, duration, onSave, onCancel }: FocusRatingProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-white">세션 완료!</h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-400">
            <span className="bg-slate-800 px-2 py-0.5 rounded-lg">{subject}</span>
            <span>·</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded-lg">{studyType}</span>
            <span>·</span>
            <span className="text-purple-400 font-semibold">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* 집중도 질문 */}
        <p className="text-center text-white font-medium mb-5">
          방금 세션의 집중도는 어땠나요?
        </p>

        {/* 이모티콘 선택 */}
        <div className="flex justify-between gap-2 mb-6">
          {FOCUS_OPTIONS.map((opt) => (
            <button
              key={opt.score}
              onClick={() => setSelected(opt.score)}
              className={`flex flex-col items-center gap-1.5 flex-1 py-3 rounded-2xl border transition-all active:scale-95
                ${selected === opt.score
                  ? SELECTED_COLORS[opt.score]
                  : 'border-slate-700 bg-slate-800'
                } ${opt.color}`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs text-slate-300 leading-tight text-center">{opt.label}</span>
              <span className="text-xs text-slate-500">{opt.score}점</span>
            </button>
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => selected !== null && onSave(selected)}
            disabled={selected === null}
            className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
