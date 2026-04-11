// src/components/AIFeedback/AIFeedback.tsx
import { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw, ChevronRight } from 'lucide-react';
import OpenAI from 'openai';
import type { StudySession } from '../../types';
import { calcSummary, calcHourlyData, calcSubjectData, formatHour } from '../../utils/dataAnalysis';

interface AIFeedbackProps {
  sessions: StudySession[];
}

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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === '여기에_OpenAI_API_키를_입력하세요') {
      setError('.env 파일에 VITE_OPENAI_API_KEY를 설정해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      const client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: '당신은 학습 패턴 분석 전문 AI 코치입니다. 학생의 학습 데이터를 분석하여 구체적이고 실행 가능한 피드백을 제공합니다. 데이터에 기반한 정확한 인사이트와 친근한 격려 메시지를 함께 제공해 주세요.',
          },
          { role: 'user', content: buildPrompt(sessions) },
        ],
      });

      const text = response.choices[0].message.content ?? '';
      setFeedback(parseAIResponse(text));
    } catch (err) {
      setError(`AI 분석 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const summary = calcSummary(sessions);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-800/20 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="text-9xl mb-8 opacity-70">🤖</div>
        <p className="text-2xl font-bold text-slate-300">학습 데이터가 더 필요해요</p>
        <p className="text-base mt-3 text-slate-400">타이머로 공부를 시작하면 데이터가 쌓여요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto selection:bg-teal-500/30">
      {/* AI 분석 버튼 영역 (핵심 UI) */}
      {!feedback && !loading && (
        <div className="text-center py-20 px-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-[0_0_60px_rgba(20,184,166,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-70"></div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-5 relative z-10 tracking-tighter">데이터가 준비되었습니다</h2>
          <p className="text-slate-300 mb-12 relative z-10 max-w-2xl mx-auto leading-relaxed">FocusMate AI가 총 <span className="text-teal-400 font-black">{summary.sessionCount}개</span>의 세션을 심층 분석할 준비를 마쳤습니다.</p>
          
          <button
            onClick={handleGenerate}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-12 py-5 rounded-3xl font-black text-lg transition-all active:scale-95 shadow-[0_0_30px_rgba(20,184,166,0.3)] z-10 hover:shadow-teal-500/50"
          >
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            초개인화 AI 리포트 생성하기
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform opacity-70" />
          </button>
        </div>
      )}

      {/* 로딩 애니메이션 */}
      {loading && (
        <div className="space-y-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 text-teal-400 mb-7 border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <RefreshCw size={36} className="animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">데이터 스캐닝 중...</h3>
            <p className="text-teal-300/90 text-sm">AI 모델이 {summary.totalMinutes}분의 학습 패턴을 분석하고 있습니다.</p>
          </div>
          <div className="grid gap-6 max-w-3xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-7 animate-pulse flex flex-col gap-4">
                <div className="h-6 bg-slate-700/50 rounded-lg w-1/4" />
                <div className="h-5 bg-slate-700/30 rounded-lg w-full" />
                <div className="h-5 bg-slate-700/30 rounded-lg w-5/6" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {feedback && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="text-teal-400" size={24} /> AI 분석 리포트
            </h3>
            <button onClick={handleGenerate} className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-800/50 px-4 py-2 rounded-xl transition-colors">
              <RefreshCw size={14} /> 재분석
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 강점 (초록색 테마) */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/50 border border-emerald-500/20 rounded-3xl p-7 md:p-9 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-colors">
              <h4 className="flex items-center gap-3.5 text-emerald-400 font-extrabold text-xl mb-7">
                <span className="p-2.5 bg-emerald-500/10 rounded-2xl"><TrendingUp size={24} /></span>
                학습 강점
              </h4>
              <ul className="space-y-5">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-slate-200 leading-relaxed text-base">
                    <span className="text-emerald-500 font-extrabold mt-1 text-lg">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* 개선점 (주황색 테마) */}
            <div className="bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-500/20 rounded-3xl p-7 md:p-9 backdrop-blur-xl shadow-xl hover:border-amber-500/40 transition-colors">
              <h4 className="flex items-center gap-3.5 text-amber-400 font-extrabold text-xl mb-7">
                <span className="p-2.5 bg-amber-500/10 rounded-2xl"><AlertCircle size={24} /></span>
                개선 포인트
              </h4>
              <ul className="space-y-5">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-slate-200 leading-relaxed text-base">
                    <span className="text-amber-500 font-extrabold mt-1 text-lg">!</span> {s}
                    
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 추천 솔루션 (보라색 테마) */}
          <div className="bg-gradient-to-br from-teal-900/30 to-indigo-900/20 border border-teal-500/20 rounded-3xl p-7 md:p-9 backdrop-blur-xl shadow-xl mt-10 hover:border-teal-500/40 transition-colors">
            <h4 className="flex items-center gap-4 text-teal-400 font-extrabold text-2xl mb-10 tracking-tight">
              <span className="p-3 bg-teal-500/10 rounded-2xl"><Lightbulb size={28} /></span>
              내일을 위한 맞춤 솔루션
            </h4>
            <div className="grid gap-6">
              {feedback.recommendations.map((r, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-7 hover:bg-slate-800/60 transition-colors flex items-center gap-6">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-lg font-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.4)]">{i + 1}</span>
                  <div className='flex-1'>
                    <span className="text-white font-black text-xl tracking-tight block mb-1.5">{r.title}</span>
                    {r.description && <p className="text-slate-400 leading-relaxed text-sm">{r.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}