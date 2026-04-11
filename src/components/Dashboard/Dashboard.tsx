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
    <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-7 hover:bg-slate-800/60 transition-colors duration-300">
      <div className="flex items-center gap-2.5 text-teal-400/80 text-sm mb-4 font-bold tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-2.5 font-medium">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-sm shadow-2xl">
        <p className="text-teal-300 font-bold mb-3">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#14B8A6' }}></span>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ sessions, onClearData }: DashboardProps) {
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
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-800/20 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="text-7xl mb-6 opacity-60">📊</div>
        <p className="text-2xl font-bold text-slate-300">데이터를 수집 중입니다</p>
        <p className="text-sm mt-3 text-slate-400 font-medium">타이머를 사용해 첫 번째 학습 세션을 기록해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard icon={<Clock size={20} />} label="총 학습 시간" value={summary.totalMinutes >= 60 ? `${Math.floor(summary.totalMinutes / 60)}h ${summary.totalMinutes % 60}m` : `${summary.totalMinutes}m`} sub={`총 ${sessions.length}개 세션`} />
        <SummaryCard icon={<Zap size={20} />} label="평균 집중도" value={`${summary.avgFocus}`} sub="5.0 만점 기준" />
        <SummaryCard icon={<TrendingUp size={20} />} label="최고 집중 시간대" value={summary.topHour >= 0 ? formatHour(summary.topHour) : '-'} sub="가장 효율이 높은 시간" />
        <SummaryCard icon={<BookOpen size={20} />} label="효율 최고 과목" value={summary.bestSubject} sub={summary.bestStudyType} />
      </div>

      {/* SVG 그라데이션 정의 (Teal & Emerald) */}
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.7}/>
          </linearGradient>
          <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
      </svg>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 시간대별 집중도 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-7 lg:p-9">
          <h3 className="text-white font-extrabold mb-8 flex items-center gap-3 text-lg">
            <span className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400"><Clock size={22}/></span> 
            시간대별 집중 트렌드
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={focusBarData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={15} />
              <YAxis domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
              <Bar dataKey="avgFocus" name="평균 집중도" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7일 추이 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-7 lg:p-9">
          <h3 className="text-white font-extrabold mb-8 flex items-center gap-3 text-lg">
            <span className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400"><TrendingUp size={22}/></span> 
            주간 집중도 변화
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={15} />
              <YAxis domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgFocus" name="평균 집중도" stroke="#14B8A6" strokeWidth={4} dot={{ fill: '#0F172A', stroke: '#14B8A6', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, fill: '#14B8A6', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onClearData} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10">
          <Trash2 size={16} /> 학습 데이터 초기화
        </button>
      </div>
    </div>
  );
}