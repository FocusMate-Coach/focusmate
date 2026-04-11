import { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <div className="text-6xl mb-4">🤖</div>
        <p className="text-lg font-medium text-slate-400">학습 데이터가 없어요</p>
        <p className="text-sm mt-2">타이머로 공부한 후 AI 분석을 받아보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 데이터 요약 */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="text-purple-400">📊</span> 분석할 학습 데이터
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {summary.totalMinutes >= 60 ? `${Math.floor(summary.totalMinutes / 60)}h` : `${summary.totalMinutes}m`}
            </div>
            <div className="text-xs text-slate-500 mt-1">총 학습 시간</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{summary.avgFocus}</div>
            <div className="text-xs text-slate-500 mt-1">평균 집중도</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{summary.sessionCount}</div>
            <div className="text-xs text-slate-500 mt-1">총 세션 수</div>
          </div>
        </div>
      </div>

      {/* AI 분석 버튼 */}
      {!feedback && !loading && (
        <div className="text-center py-8">
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95 shadow-lg shadow-purple-900/40"
          >
            <Sparkles size={22} />
            AI 학습 분석 시작
          </button>
          <p className="text-xs text-slate-500 mt-3">AI가 나만의 학습 패턴을 분석해 드려요</p>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-3 text-purple-400 text-sm font-medium">
              <RefreshCw size={18} className="animate-spin" />
              AI가 학습 패턴을 분석하고 있어요...
            </div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-700/60 rounded w-full mb-2" />
              <div className="h-3 bg-slate-700/60 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="flex items-start gap-3 bg-red-900/30 border border-red-800 rounded-2xl p-5 text-red-300 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* 결과 */}
      {feedback && (
        <div className="space-y-4">
          {/* 강점 */}
          {feedback.strengths.length > 0 && (
            <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                <TrendingUp size={18} />
                학습 강점
              </h4>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 개선 포인트 */}
          {feedback.improvements.length > 0 && (
            <div className="bg-amber-900/20 border border-amber-800/50 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-amber-400 font-semibold mb-3">
                <AlertCircle size={18} />
                개선 포인트
              </h4>
              <ul className="space-y-2">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-amber-500 mt-0.5">!</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 추천 행동 */}
          {feedback.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-blue-400 font-semibold">
                <Lightbulb size={18} />
                맞춤 학습 추천
              </h4>
              {feedback.recommendations.map((r, i) => (
                <div key={i} className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-white font-medium">{r.title}</span>
                  </div>
                  {r.description && (
                    <p className="text-slate-400 text-sm ml-9">{r.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 재분석 버튼 */}
          <div className="text-center pt-2">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 transition-colors"
            >
              <RefreshCw size={14} />
              다시 분석하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
