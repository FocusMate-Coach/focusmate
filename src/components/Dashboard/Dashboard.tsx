// src/components/Dashboard/Dashboard.tsx
import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { Clock, Zap, TrendingUp, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StudySession } from '../../types';
import { calcHourlyData, calcWeeklyTrend, calcSummary, calcMonthlyCalendar, formatHour } from '../../utils/dataAnalysis';

interface DashboardProps {
  sessions: StudySession[];
  onClearData: () => void;
}

function focusColor(score: number): string {
  if (score >= 4.5) return 'url(#colorHigh)';
  if (score >= 3.5) return 'url(#colorMid)';
  if (score >= 2.5) return '#E4DFB5';
  return '#FBE8CE';
}

function calendarBg(minutes: number): string {
  if (minutes === 0) return 'transparent';
  if (minutes < 30)  return 'rgba(189,166,206,0.15)';
  if (minutes < 60)  return 'rgba(189,166,206,0.30)';
  if (minutes < 120) return 'rgba(189,166,206,0.50)';
  if (minutes < 180) return 'rgba(189,166,206,0.70)';
  return 'rgba(155,142,199,0.85)';
}

function formatStudyTime(minutes: number): string {
  if (minutes === 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h + ':' + String(m).padStart(2, '0');
}

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-[2rem] p-5 lg:p-7 hover:bg-white hover:shadow-md transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2.5 text-slate-500 text-xs lg:text-sm mb-3 lg:mb-4 font-bold tracking-wide">
        <span className="text-[#BDA6CE]">{icon}</span>
        {label}
      </div>
      <div className="text-2xl lg:text-3xl font-black text-[#9B8EC7] tracking-tight">{value}</div>
      {sub && <div className="text-[10px] lg:text-xs text-slate-400 mt-2 font-medium">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-2xl p-4 lg:p-5 text-xs lg:text-sm shadow-xl">
        <p className="text-[#9B8EC7] font-bold mb-3">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-slate-700 font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B4D3D9]"></span>
            {p.name}: <span className="font-bold text-[#9B8EC7]">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function StudyCalendar({ sessions }: { sessions: StudySession[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const calendarData = useMemo(
    () => calcMonthlyCalendar(sessions, year, month),
    [sessions, year, month]
  );

  const firstDayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  const handlePrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const handleNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-3xl p-5 lg:p-9 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-800 font-extrabold flex items-center gap-3 text-base lg:text-lg">
          <span className="p-2 lg:p-2.5 bg-[#BDA6CE]/20 rounded-xl text-[#BDA6CE]">
            <Calendar size={20} />
          </span>
          월별 학습 캘린더
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#BDA6CE]/20 text-slate-500 hover:text-[#9B8EC7] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-black text-slate-700 min-w-[70px] text-center">
            {year}년 {MONTH_NAMES[month - 1]}
          </span>
          <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#BDA6CE]/20 text-slate-500 hover:text-[#9B8EC7] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-[10px] lg:text-xs font-black text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={'e'+i} />
        ))}
        {calendarData.map(({ day, totalMinutes }) => {
          const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();
          return (
            <div
              key={day}
              style={{ backgroundColor: calendarBg(totalMinutes) }}
              className={'rounded-xl p-1 lg:p-1.5 flex flex-col items-center justify-center min-h-[44px] lg:min-h-[52px] transition-all' + (isToday ? ' ring-2 ring-[#9B8EC7]' : '')}
            >
              <span className={'text-[10px] lg:text-xs font-bold ' + (totalMinutes > 0 ? 'text-slate-700' : 'text-slate-400')}>
                {day}
              </span>
              {totalMinutes > 0 && (
                <span className="text-[9px] lg:text-[10px] font-black text-[#9B8EC7] mt-0.5 tabular-nums">
                  {formatStudyTime(totalMinutes)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-slate-400 font-medium">적음</span>
        {['rgba(189,166,206,0.15)','rgba(189,166,206,0.30)','rgba(189,166,206,0.50)','rgba(189,166,206,0.70)','rgba(155,142,199,0.85)'].map((bg, i) => (
          <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: bg }} />
        ))}
        <span className="text-[10px] text-slate-400 font-medium">많음</span>
      </div>
    </div>
  );
}

export default function Dashboard({ sessions, onClearData }: DashboardProps) {
  const summary = useMemo(() => calcSummary(sessions), [sessions]);
  const hourlyData = useMemo(() => calcHourlyData(sessions).filter(h => h.sessionCount > 0 || h.hour % 3 === 0), [sessions]);
  const weeklyData = useMemo(() => calcWeeklyTrend(sessions), [sessions]);

  const todayMinutes = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.date === todayStr);
    const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
    return { minutes: Math.floor(todaySeconds / 60), count: todaySessions.length };
  }, [sessions]);

  const focusBarData = useMemo(
    () => hourlyData.map(h => ({ ...h, label: h.hour + '시', fill: focusColor(h.avgFocus) })),
    [hourlyData]
  );

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-slate-500 bg-white/50 rounded-3xl border border-[#BDA6CE]/30 backdrop-blur-sm mx-4 lg:mx-0 shadow-sm">
        <div className="text-5xl lg:text-7xl mb-6 opacity-60">📊</div>
        <p className="text-xl lg:text-2xl font-bold text-slate-700">데이터를 수집 중입니다</p>
        <p className="text-xs lg:text-sm mt-3 text-slate-400 font-medium">타이머를 사용해 첫 번째 학습 세션을 기록해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <SummaryCard icon={<Clock size={18} />} label="금일 학습 시간" value={todayMinutes.minutes >= 60 ? Math.floor(todayMinutes.minutes/60)+'h '+(todayMinutes.minutes%60)+'m' : todayMinutes.minutes+'m'} sub={'오늘 '+todayMinutes.count+'개 세션'} />
        <SummaryCard icon={<Calendar size={18} />} label="총 학습 시간" value={summary.totalMinutes >= 60 ? Math.floor(summary.totalMinutes/60)+'h '+(summary.totalMinutes%60)+'m' : summary.totalMinutes+'m'} sub={'총 '+sessions.length+'개 세션'} />
        <SummaryCard icon={<Zap size={18} />} label="평균 집중도" value={''+summary.avgFocus} sub="5.0 만점 기준" />
        <SummaryCard icon={<TrendingUp size={18} />} label="최고 집중 시간대" value={summary.topHour >= 0 ? formatHour(summary.topHour) : '-'} sub="가장 효율이 높은 시간" />
      </div>

      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B4D3D9" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#B4D3D9" stopOpacity={0.5}/>
          </linearGradient>
          <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BDA6CE" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#BDA6CE" stopOpacity={0.5}/>
          </linearGradient>
        </defs>
      </svg>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="bg-white/80 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-3xl p-5 lg:p-9 shadow-sm hover:shadow-md transition-all">
          <h3 className="text-slate-800 font-extrabold mb-6 lg:mb-8 flex items-center gap-3 text-base lg:text-lg">
            <span className="p-2 lg:p-2.5 bg-[#B4D3D9]/20 rounded-xl text-[#B4D3D9]"><Clock size={20}/></span>
            시간대별 집중 트렌드
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={focusBarData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} opacity={0.5} />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#64748B', opacity: 0.05 }} />
              <Bar dataKey="avgFocus" name="평균 집중도" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-[#BDA6CE]/30 rounded-3xl p-5 lg:p-9 shadow-sm hover:shadow-md transition-all">
          <h3 className="text-slate-800 font-extrabold mb-6 lg:mb-8 flex items-center gap-3 text-base lg:text-lg">
            <span className="p-2 lg:p-2.5 bg-[#BDA6CE]/20 rounded-xl text-[#BDA6CE]"><TrendingUp size={20}/></span>
            주간 집중도 변화
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} opacity={0.5} />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgFocus" name="평균 집중도" stroke="#B4D3D9" strokeWidth={3} dot={{ fill: '#FFFFFF', stroke: '#B4D3D9', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#B4D3D9', stroke: '#FFFFFF', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <StudyCalendar sessions={sessions} />

      <div className="flex justify-end pt-2 pb-6 lg:pb-0">
        <button onClick={onClearData} className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10">
          <Trash2 size={16} /> 학습 데이터 초기화
        </button>
      </div>
    </div>
  );
}
