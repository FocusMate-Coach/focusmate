// src/components/Dashboard/Dashboard.tsx
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { Clock, Zap, BookOpen, TrendingUp, Trash2 } from 'lucide-react';
import type { StudySession } from '../../types';
import { calcHourlyData, calcWeeklyTrend, calcSummary, formatHour } from '../../utils/dataAnalysis';

interface DashboardProps {
  sessions: StudySession[];
  onClearData: () => void;
}

function focusColor(score: number): string {
  if (score >= 4.5) return 'url(#colorHigh)';
  if (score >= 3.5) return 'url(#colorMid)';
  if (score >= 2.5) return '#F59E0B';
  return '#EF4444';
}

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center gap-2 text-purple-300/80 text-sm mb-3 font-medium">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-2">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-sm shadow-2xl">
        <p className="text-purple-300 font-medium mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A855F7' }}></span>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ sessions, onClearData }: DashboardProps) {
  // 사용하지 않는 변수 에러 제거 완료!
  const summary = useMemo(() => calcSummary(sessions), [sessions]);
  const hourlyData = useMemo(() => calcHourlyData(sessions).filter(h => h.sessionCount > 0 || h.hour % 3 === 0), [sessions]);
  const weeklyData = useMemo(() => calcWeeklyTrend(sessions), [sessions]);

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
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-800/30 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="text-6xl mb-6 opacity-80">📊</div>
        <p className="text-xl font-semibold text-slate-300">아직 학습 데이터가 없어요</p>
        <p className="text-sm mt-2 text-slate-400">타이머로 공부를 시작하면 데이터가 쌓여요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard icon={<Clock size={18} />} label="총 학습 시간" value={summary.totalMinutes >= 60 ? `${Math.floor(summary.totalMinutes / 60)}h ${summary.totalMinutes % 60}m` : `${summary.totalMinutes}m`} sub={`${sessions.length}개 세션`} />
        <SummaryCard icon={<Zap size={18} />} label="평균 집중도" value={`${summary.avgFocus}`} sub="5.0 만점 기준" />
        <SummaryCard icon={<TrendingUp size={18} />} label="최고 집중 시간대" value={summary.topHour >= 0 ? formatHour(summary.topHour) : '-'} sub="가장 효율이 높은 시간" />
        <SummaryCard icon={<BookOpen size={18} />} label="효율 최고 과목" value={summary.bestSubject} sub={summary.bestStudyType} />
      </div>

      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </svg>

      {/* 시간대별 집중도 */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 lg:p-8 shadow-lg">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
          <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Clock size={20}/></span> 
          시간대별 평균 집중도
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={focusBarData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
            <Bar dataKey="avgFocus" name="평균 집중도" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 7일 추이 */}
      <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 lg:p-8 shadow-lg">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><TrendingUp size={20}/></span> 
          7일 집중도 추이
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="avgFocus" name="평균 집중도" stroke="#A855F7" strokeWidth={3} dot={{ fill: '#0F172A', stroke: '#A855F7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#A855F7' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onClearData} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10">
          <Trash2 size={16} /> 데이터 초기화 (가상 데이터 재주입)
        </button>
      </div>
    </div>
  );
}