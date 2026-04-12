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

// 🎨 수정: 두 번째 사진의 파스텔 퍼플(#BDA6CE) & 민트(#B4D3D9) 팔레트 복구
function focusColor(score: number): string {
  if (score >= 4.5) return 'url(#colorHigh)';       
  if (score >= 3.5) return 'url(#colorMid)';        
  if (score >= 2.5) return '#E4DFB5';   
  return '#FBE8CE';                    
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
      <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-slate-500 bg-white/50 rounded-3xl border border-[#BDA6CE]/30 backdrop-blur-sm mx-4 lg:mx-0 shadow-sm">
        <div className="text-5xl lg:text-7xl mb-6 opacity-60">📊</div>
        <p className="text-xl lg:text-2xl font-bold text-slate-700">데이터를 수집 중입니다</p>
        <p className="text-xs lg:text-sm mt-3 text-slate-400 font-medium">타이머를 사용해 첫 번째 학습 세션을 기록해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <SummaryCard icon={<Clock size={18} />} label="총 학습 시간" value={summary.totalMinutes >= 60 ? `${Math.floor(summary.totalMinutes / 60)}h ${summary.totalMinutes % 60}m` : `${summary.totalMinutes}m`} sub={`총 ${sessions.length}개 세션`} />
        <SummaryCard icon={<Zap size={18} />} label="평균 집중도" value={`${summary.avgFocus}`} sub="5.0 만점 기준" />
        <SummaryCard icon={<TrendingUp size={18} />} label="최고 집중 시간대" value={summary.topHour >= 0 ? formatHour(summary.topHour) : '-'} sub="가장 효율이 높은 시간" />
        <SummaryCard icon={<BookOpen size={18} />} label="효율 최고 과목" value={summary.bestSubject} sub={summary.bestStudyType} />
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
        {/* 시간대별 집중도 */}
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

        {/* 7일 추이 */}
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

      <div className="flex justify-end pt-2 pb-6 lg:pb-0">
        <button onClick={onClearData} className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10">
          <Trash2 size={16} /> 학습 데이터 초기화
        </button>
      </div>
    </div>
  );
}