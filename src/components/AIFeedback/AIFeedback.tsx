// src/components/AIFeedback/AIFeedback.tsx
import { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw, ChevronRight } from 'lucide-react';
import type { StudySession } from '../../types';
import { calcSummary, calcHourlyData, calcSubjectData, formatHour } from '../../utils/dataAnalysis';

interface AIFeedbackProps {
  sessions: StudySession[];
}

// 💡 AI 프롬프트 생성 함수
function buildPrompt(sessions: StudySession[]): string {
  const summary = calcSummary(sessions);
  const hourlyData = calcHourlyData(sessions).filter(h => h.sessionCount > 0);
  const subjectData = calcSubjectData(sessions);

  const topHours = [...hourlyData].sort((a, b) => b.avgFocus - a.avgFocus).slice(0, 3);
  const worstHours = [...hourlyData].sort((a, b) => a.avgFocus - b.avgFocus).slice(0, 2);

  const typeMap = new Map<string, { total: number; count: number }>();
  sessions.forEach(s => {
    const prev = typeMap.get(s.studyType) ?? { total: 0, count: 0 };
    typeMap.set(s.studyType, { total: prev.total + s.focusScore, count: prev.count + 1 });
  });
  const typeStats = Array.from(typeMap.entries())
    .map(([t, d]) => `${t}: ${(d.total / d.count).toFixed(1)}점`)
    .join(', ');

  return `다음은 학생의 최근 7일 학습 데이터입니다:

▶ 총 학습 시간: ${summary.totalMinutes >= 60 ? `${Math.floor(summary.totalMinutes / 60)}시간 ${summary.totalMinutes % 60}분` : `${summary.totalMinutes}분`}
▶ 총 세션 수: ${summary.sessionCount}개
▶ 평균 집중도: ${summary.avgFocus} / 5.0

▶ 집중도 상위 시간대: ${topHours.map(h => `${formatHour(h.hour)}(${h.avgFocus}점)`).join(', ')}
▶ 집중도 하위 시간대: ${worstHours.map(h => `${formatHour(h.hour)}(${h.avgFocus}점)`).join(', ')}

▶ 과목별 학습 시간 및 평균 집중도:
${subjectData.map(s => `  - ${s.subject}: ${s.totalMinutes}분, 평균 ${s.avgFocus}점 (${s.sessionCount}세션)`).join('\n')}

▶ 학습 유형별 평균 집중도: ${typeStats}

위 데이터를 분석하여 다음 형식으로 피드백을 작성해 주세요:

## 학습 강점
- [강점 1: 구체적인 데이터 근거 포함]
- [강점 2: 구체적인 데이터 근거 포함]

## 개선 포인트
- [개선이 필요한 부분 1가지: 구체적인 데이터 근거 포함]

## 맞춤 학습 추천
1. [추천 제목]: [구체적인 행동 방법, 시간대 명시]
2. [추천 제목]: [구체적인 행동 방법, 시간대 명시]
3. [추천 제목]: [구체적인 행동 방법, 시간대 명시]

응답은 학생이 바로 실천할 수 있도록 친근하고 구체적으로, 한국어로 작성해 주세요.`;
}

// 💡 AI 응답 파싱 함수
function parseAIResponse(text: string) {
  const strengthMatch = text.match(/## 학습 강점\n([\s\S]*?)(?=\n##|$)/);
  const improvementMatch = text.match(/## 개선 포인트\n([\s\S]*?)(?=\n##|$)/);
  const recommendMatch = text.match(/## 맞춤 학습 추천\n([\s\S]*?)(?=\n##|$)/);

  const extractBullets = (str: string) =>
    str.split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^-\s*/, '').trim());

  const extractNumbered = (str: string) =>
    str.split('\n')
      .filter(l => /^\d+\./.test(l.trim()))
      .map(l => {
        const withoutNum = l.replace(/^\d+\.\s*/, '').trim();
        const colonIdx = withoutNum.indexOf(':');
        if (colonIdx > 0) {
          return {
            title: withoutNum.slice(0, colonIdx).trim(),
            description: withoutNum.slice(colonIdx + 1).trim(),
          };
        }
        return { title: withoutNum, description: '' };
      });

  return {
    strengths: strengthMatch ? extractBullets(strengthMatch[1]) : [],
    improvements: improvementMatch ? extractBullets(improvementMatch[1]) : [],
    recommendations: recommendMatch ? extractNumbered(recommendMatch[1]) : [],
  };
}

export default function AIFeedback({ sessions }: AIFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ReturnType<typeof parseAIResponse> | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(sessions) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? '서버 오류가 발생했습니다.');
      }

      setFeedback(parseAIResponse(data.text));
    } catch (err) {
      setError(`AI 분석 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const summary = calcSummary(sessions);

  // 데이터 없음 화면
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-slate-500 bg-white/50 rounded-[2.5rem] border border-[#BDA6CE]/30 backdrop-blur-sm mx-4 lg:mx-0 shadow-sm animate-fade-in-up mt-8">
        <div className="text-7xl lg:text-9xl mb-6 opacity-60 grayscale">🤖</div>
        <p className="text-xl lg:text-2xl font-bold text-slate-700">학습 데이터가 더 필요해요</p>
        <p className="text-xs lg:text-sm mt-3 text-slate-400 font-medium">타이머로 공부를 시작하면 데이터가 쌓여요!</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-8 animate-fade-in-up pb-20">

      {/* 🖤 요청하신 예쁜 검은색 글씨 헤더만 딱 남겼습니다! */}
      <div className="w-full flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          AI 피드백 <Sparkles size={24} className="text-[#9B8EC7]" />
        </h1>
        <p className="text-sm text-slate-500 font-medium">AI가 분석한 맞춤형 학습 리포트입니다</p>
      </div>

      {error && (
        <div className="w-full p-4 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100 font-medium">
          {error}
        </div>
      )}

      {/* AI 분석 시작 버튼 영역 */}
      {!feedback && !loading && (
        <div className="w-full text-center py-16 px-6 bg-white/80 rounded-[2.5rem] border border-[#BDA6CE]/30 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 tracking-tighter">데이터가 준비되었습니다</h2>
          <p className="text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">FocusMate AI가 총 <span className="text-[#9B8EC7] font-black text-lg">{summary.sessionCount}개</span>의 세션을 심층 분석할 준비를 마쳤습니다.</p>
          
          <button
            onClick={handleGenerate}
            className="group relative inline-flex items-center gap-2 bg-[#9B8EC7] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-[0_0_20px_rgba(155,142,199,0.3)] hover:bg-[#8A7CB3] hover:shadow-lg"
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            초개인화 AI 리포트 생성하기
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform opacity-70" />
          </button>
        </div>
      )}

      {/* 로딩 애니메이션 */}
      {loading && (
        <div className="w-full py-16 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#BDA6CE]/20 text-[#9B8EC7] mb-6 shadow-inner">
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">데이터 스캐닝 중...</h3>
          <p className="text-slate-500 text-sm">AI 모델이 {summary.totalMinutes}분의 학습 패턴을 분석하고 있습니다.</p>
        </div>
      )}

      {/* 분석 결과 리포트 */}
      {feedback && (
        <div className="w-full bg-white/90 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-[2.5rem] p-6 md:p-10 shadow-sm flex flex-col gap-8 md:gap-12 animate-fade-in-up">
          
          {/* 상단 리포트 헤더 & 재분석 버튼 */}
          <div className="flex items-center justify-between pb-4 border-b border-[#BDA6CE]/20">
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-[#9B8EC7]" size={22} /> AI 분석 리포트
            </h3>
            <button onClick={handleGenerate} className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-[#9B8EC7] bg-[#F2EAE0]/50 px-4 py-2 rounded-xl transition-colors hover:bg-[#F2EAE0]">
              <RefreshCw size={14} /> 재분석
            </button>
          </div>

          {/* 섹션 1: 학습 강점 (민트 포인트) */}
          <section className="flex flex-col gap-4">
            <h4 className="flex items-center gap-3 text-[#B4D3D9] font-extrabold text-lg">
              <span className="p-2 bg-[#B4D3D9]/10 rounded-xl"><TrendingUp size={20} /></span>
              학습 강점
            </h4>
            <div className="bg-[#B4D3D9]/5 rounded-2xl p-5 border border-[#B4D3D9]/20">
              <ul className="space-y-4">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed text-sm md:text-base font-medium">
                    <span className="text-[#B4D3D9] font-extrabold mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 섹션 2: 개선 포인트 (연보라 포인트) */}
          <section className="flex flex-col gap-4">
            <h4 className="flex items-center gap-3 text-[#BDA6CE] font-extrabold text-lg">
              <span className="p-2 bg-[#BDA6CE]/10 rounded-xl"><AlertCircle size={20} /></span>
              개선 포인트
            </h4>
            <div className="bg-[#BDA6CE]/5 rounded-2xl p-5 border border-[#BDA6CE]/20">
              <ul className="space-y-4">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed text-sm md:text-base font-medium">
                    <span className="text-[#BDA6CE] font-extrabold mt-0.5">!</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 섹션 3: 추천 솔루션 (메인 딥 퍼플 포인트) */}
          <section className="flex flex-col gap-4">
            <h4 className="flex items-center gap-3 text-[#9B8EC7] font-extrabold text-lg md:text-xl">
              <span className="p-2 bg-[#9B8EC7]/10 rounded-xl"><Lightbulb size={24} /></span>
              내일을 위한 맞춤 솔루션
            </h4>
            <div className="flex flex-col gap-3">
              {feedback.recommendations.map((r, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white border border-[#BDA6CE]/20 hover:border-[#9B8EC7]/40 hover:bg-[#F2EAE0]/30 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#9B8EC7] text-white text-lg font-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(155,142,199,0.3)]">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-800 font-bold text-base md:text-lg block mb-1">{r.title}</span>
                    {r.description && <p className="text-slate-500 text-sm leading-relaxed">{r.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}