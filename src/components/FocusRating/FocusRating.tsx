// src/components/FocusRating/FocusRating.tsx
import { useState } from 'react';
import { Award, BookOpen, Clock3, X, Check } from 'lucide-react';
import type { Subject, StudyType } from '../../types';
import { formatDuration } from '../../utils/dataAnalysis';

interface FocusRatingProps {
  subject: Subject;
  studyType: StudyType;
  duration: number; // 초 단위
  onSave: (score: number) => void;
  onCancel: () => void;
}

// 라이트 모드에 어울리는 파스텔 톤 색상과 기존 한글 레이블 유지
const FOCUS_OPTIONS = [
  { score: 1, emoji: '😴', label: '집중 안됨', color: 'hover:bg-rose-100 border-rose-100', activeColor: 'bg-rose-500 text-white shadow-rose-200' },
  { score: 2, emoji: '😕', label: '조금 산만', color: 'hover:bg-amber-100 border-amber-100', activeColor: 'bg-amber-500 text-white shadow-amber-200' },
  { score: 3, emoji: '😐', label: '보통',     color: 'hover:bg-slate-100 border-slate-200', activeColor: 'bg-slate-500 text-white shadow-slate-200' },
  { score: 4, emoji: '😊', label: '집중 양호', color: 'hover:bg-sky-100 border-sky-100', activeColor: 'bg-sky-500 text-white shadow-sky-200' },
  { score: 5, emoji: '🔥', label: '완전 집중', color: 'hover:bg-emerald-100 border-emerald-100', activeColor: 'bg-emerald-500 text-white shadow-emerald-200' },
];

export default function FocusRating({ subject, studyType, duration, onSave, onCancel }: FocusRatingProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    // 배경을 차분하게 만들어주는 블러 오버레이
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      
      {/* 라이트 모드 "Airy Minimal" 테마가 적용된 모달 창 */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/60 shadow-soft w-full max-w-lg p-8 md:p-10 relative overflow-hidden">
        
        {/* 상단 장식 오로라 빛 (Layout.tsx와 통일) */}
        <div className="absolute top-[-20%] right-[-10%] w-56 h-56 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

        {/* 닫기 버튼 */}
        <button 
          onClick={onCancel} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* 1. 헤더: 산뜻한 아이콘과 제목 */}
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-500 shadow-sm border border-indigo-200">
            <Award size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">세션 완료!</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">방금 학습의 집중도는 어땠나요?</p>
          </div>
        </div>

        {/* 2. 세션 정보 배지 (라이트 모드 테마 적용) */}
        <div className="flex items-center justify-between mb-10 relative z-10 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shadow-inner">
          <div className="flex items-center gap-3 text-slate-700 overflow-hidden">
            <BookOpen size={18} className="text-indigo-500 shrink-0" />
            <span className="text-sm font-bold truncate">{subject} <span className="text-slate-300 mx-1">|</span> {studyType}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 shrink-0 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
            <Clock3 size={16} />
            <span className="text-sm font-bold tabular-nums">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* 3. 핵심: 부드러운 점수 선택 버튼 (Claymorphism 효과) */}
        <div className="flex justify-between gap-2 md:gap-3 mb-10 relative z-10">
          {FOCUS_OPTIONS.map((opt) => {
            const isSelected = selected === opt.score;
            return (
              <button
                key={opt.score}
                onClick={() => setSelected(opt.score)}
                className={`group flex flex-col items-center flex-1 py-4 px-1 rounded-[1.5rem] border transition-all duration-300 active:scale-95 ${
                  isSelected
                    ? `${opt.activeColor} shadow-lg border-transparent scale-[1.05] -translate-y-1`
                    : `bg-white/50 border-slate-200 text-slate-600 ${opt.color} hover:shadow-sm`
                }`}
              >
                <span className={`text-3xl mb-2 transition-transform group-hover:scale-110 ${isSelected ? 'animate-bounce' : ''}`}>
                  {opt.emoji}
                </span>
                <span className={`text-[11px] font-extrabold tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                  {opt.label}
                </span>
                <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  {opt.score}점
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. 하단 액션 버튼 */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-bold text-slate-500 hover:text-slate-800 py-4 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
          >
            취소
          </button>
          <button
            onClick={() => selected !== null && onSave(selected)}
            disabled={selected === null}
            className={`flex-[2] flex items-center justify-center gap-2 text-sm font-black py-4 rounded-2xl shadow-sm transition-all duration-300 ${
              selected !== null
                ? 'bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow-glow hover:scale-[1.02] hover:shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Check size={18} strokeWidth={3} />
            기록 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}