import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { Clock, Zap, BookOpen, TrendingUp, Trash2 } from 'lucide-react';
import type { StudySession } from '../../types';
import { calcHourlyData, calcSubjectData, calcWeeklyTrend, calcSummary, getTodaySessions, formatDuration, formatHour } from '../../utils/dataAnalysis';

interface DashboardProps {
  sessions: StudySession[];
  onClearData: () => void;
}

function focusColor(score: number): string {
  if (score >= 4.5) return '#8B5CF6';
  if (score >= 3.5) return '#3B82F6';
  if (score >= 2.5) return '#F59E0B';
  return '#EF4444';
}

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ sessions, onClearData }: DashboardProps) {
  const summary = useMemo(() => calcSummary(sessions), [sessions]);
  const hourlyData = useMemo(() => calcHourlyData(sessions).filter(h => h.sessionCount > 0 || h.hour % 3 === 0), [sessions]);
  const subjectData = useMemo(() => calcSubjectData(sessions), [sessions]);
  const weeklyData = useMemo(() => calcWeeklyTrend(sessions), [sessions]);
  const todaySessions = useMemo(() => getTodaySessions(sessions), [sessions]);

  const focusBarData = useMemo(
    () => hourlyData.map(h => ({
      ...h,
      label: `${h.hour}시`,
      fill: focusColor(h.avgFocus),
    })),
    [hourlyData]
  );

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg font-medium text-slate-400">아직 학습 데이터가 없어요</p>
        <p className="text-sm mt-2">타이머로 공부를 시작하면 데이터가 쌓여요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Clock size={16} />}
          label="총 학습 시간"
          value={summary.totalMinutes >= 60 ? `${Math.floor(summary.totalMinutes / 60)}시간 ${summary.totalMinutes % 60}분` : `${summary.totalMinutes}분`}
          sub={`${sessions.length}개 세션`}
        />
        <SummaryCard
          icon={<Zap size={16} />}
          label="평균 집중도"
          value={`${summary.avgFocus} / 5`}
          sub="전체 세션 기준"
        />
        <SummaryCard
          icon={<TrendingUp size={16} />}
          label="최고 집중 시간대"
          value={summary.topHour >= 0 ? formatHour(summary.topHour) : '-'}
          sub="집중도가 가장 높은 시간"
        />
        <SummaryCard
          icon={<BookOpen size={16} />}
          label="효율 최고 과목"
          value={summary.bestSubject}
          sub={summary.bestStudyType}
        />
      </div>

      {/* 시간대별 집중도 */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="text-purple-400">⏰</span> 시간대별 평균 집중도
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={focusBarData} margin={{ top: 4, right: 8, bottom: 4, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgFocus" name="평균 집중도" radius={[4, 4, 0, 0]} fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
        {summary.worstHour >= 0 && (
          <p className="text-xs text-slate-500 mt-3">
            💡 <strong className="text-slate-400">{formatHour(summary.worstHour)}</strong>은 집중도가 낮은 편이에요. 가벼운 복습이나 휴식을 추천해요.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 과목별 학습 시간 */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-400">📚</span> 과목별 학습 시간 (분)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={subjectData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis type="category" dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalMinutes" name="학습 시간(분)" radius={[0, 4, 4, 0]}>
                {subjectData.map((entry, index) => (
                  <rect key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7일 추이 */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-emerald-400">📈</span> 7일 집중도 추이
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData} margin={{ top: 4, right: 16, bottom: 4, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="avgFocus"
                name="평균 집중도"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                dot={{ fill: '#8B5CF6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 오늘의 세션 */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="text-amber-400">📝</span> 오늘의 학습 기록
          <span className="ml-auto text-sm text-slate-500 font-normal">{todaySessions.length}개 세션</span>
        </h3>
        {todaySessions.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">오늘 기록된 세션이 없어요</p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-4 py-3">
                <span className="text-2xl">{'😴😕😐😊🔥'[s.focusScore - 1]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span className="font-medium">{s.subject}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{s.studyType}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {s.startTime} ~ {s.endTime} · {formatDuration(s.duration)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-purple-400">{s.focusScore}점</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 데이터 초기화 */}
      <div className="flex justify-end">
        <button
          onClick={onClearData}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-900/20"
        >
          <Trash2 size={14} />
          데이터 초기화 (가상 데이터 재주입)
        </button>
      </div>
    </div>
  );
}
