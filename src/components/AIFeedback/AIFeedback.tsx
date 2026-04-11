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
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-800/30 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="text-6xl mb-6 opacity-80 animate-bounce">🤖</div>
        <p className="text-xl font-semibold text-slate-300">데이터가 더 필요해요</p>
        <p className="text-sm mt-2 text-slate-400">타이머를 사용해 데이터를 쌓으면 AI가 분석해 드립니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
      
      {/* 에러 발생 시 보여주는 UI 추가 */}
      {error && (
        <div className="flex items-start gap-3 bg-red-900/30 border border-red-800/50 rounded-2xl p-5 text-red-300 text-sm animate-fade-in-up shadow-lg backdrop-blur-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* AI 분석 버튼 영역 (핵심 UI) */}
      {!feedback && !loading && (
        <div className="text-center py-16 px-4 bg-slate-800/30 rounded-3xl border border-white/5 backdrop-blur-sm relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-50"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">데이터가 준비되었습니다</h2>
          <p className="text-slate-400 mb-10 relative z-10">FocusMate AI가 총 <span className="text-purple-400 font-bold">{summary.sessionCount}개</span>의 세션을 심층 분석할 준비를 마쳤습니다.</p>
          
          <button
            onClick={handleGenerate}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] z-10"
          >
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            초개인화 AI 리포트 생성하기
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform opacity-70" />
          </button>
        </div>
      )}

      {/* 로딩 애니메이션 */}
      {loading && (
        <div className="space-y-6 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 mb-6 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <RefreshCw size={32} className="animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">데이터 스캐닝 중...</h3>
            <p className="text-purple-300/80 text-sm">AI 모델이 {summary.totalMinutes}분의 학습 패턴을 분석하고 있습니다.</p>
          </div>
          <div className="grid gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 animate-pulse flex flex-col gap-3">
                <div className="h-5 bg-slate-700/50 rounded-md w-1/4" />
                <div className="h-4 bg-slate-700/30 rounded-md w-full" />
                <div className="h-4 bg-slate-700/30 rounded-md w-5/6" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {feedback && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} /> AI 분석 리포트
            </h3>
            <button onClick={handleGenerate} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw size={12} /> 재분석
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 강점 (초록색 테마) */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border border-emerald-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg hover:border-emerald-500/40 transition-colors">
              <h4 className="flex items-center gap-3 text-emerald-400 font-bold text-lg mb-6">
                <span className="p-2 bg-emerald-500/10 rounded-xl"><TrendingUp size={22} /></span>
                학습 강점
              </h4>
              <ul className="space-y-4">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200 leading-relaxed">
                    <span className="text-emerald-500 font-bold mt-1">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* 개선점 (주황색 테마) */}
            <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/50 border border-amber-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg hover:border-amber-500/40 transition-colors">
              <h4 className="flex items-center gap-3 text-amber-400 font-bold text-lg mb-6">
                <span className="p-2 bg-amber-500/10 rounded-xl"><AlertCircle size={22} /></span>
                개선 포인트
              </h4>
              <ul className="space-y-4">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200 leading-relaxed">
                    <span className="text-amber-500 font-bold mt-1">!</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 추천 솔루션 (보라색 테마) */}
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg mt-8 hover:border-purple-500/40 transition-colors">
            <h4 className="flex items-center gap-3 text-purple-400 font-bold text-xl mb-8">
              <span className="p-2 bg-purple-500/10 rounded-xl"><Lightbulb size={24} /></span>
              내일을 위한 맞춤 솔루션
            </h4>
            <div className="grid gap-4">
              {feedback.recommendations.map((r, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">{i + 1}</span>
                    <span className="text-white font-bold text-lg tracking-tight">{r.title}</span>
                  </div>
                  {r.description && <p className="text-slate-400 leading-relaxed ml-12">{r.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}