import type { StudySession, HourlyData, SubjectData, DailyData, StudySummary } from '../types';

const SUBJECT_COLORS: Record<string, string> = {
  '수학': '#8B5CF6',
  '영어': '#3B82F6',
  '국어': '#10B981',
  '과학': '#F59E0B',
  '사회': '#EF4444',
  '기타': '#6B7280',
};

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export function formatHour(hour: number): string {
  if (hour === 0) return '자정';
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return '정오';
  return `오후 ${hour - 12}시`;
}

export function calcHourlyData(sessions: StudySession[]): HourlyData[] {
  const hourMap = new Map<number, { totalFocus: number; totalSecs: number; count: number }>();

  sessions.forEach((s) => {
    const prev = hourMap.get(s.hour) ?? { totalFocus: 0, totalSecs: 0, count: 0 };
    hourMap.set(s.hour, {
      totalFocus: prev.totalFocus + s.focusScore,
      totalSecs: prev.totalSecs + s.duration,
      count: prev.count + 1,
    });
  });

  return Array.from({ length: 24 }, (_, hour) => {
    const data = hourMap.get(hour);
    return {
      hour,
      label: formatHour(hour),
      avgFocus: data ? Math.round((data.totalFocus / data.count) * 10) / 10 : 0,
      totalMinutes: data ? Math.round(data.totalSecs / 60) : 0,
      sessionCount: data?.count ?? 0,
    };
  });
}

export function calcSubjectData(sessions: StudySession[]): SubjectData[] {
  const map = new Map<string, { totalSecs: number; totalFocus: number; count: number }>();

  sessions.forEach((s) => {
    const prev = map.get(s.subject) ?? { totalSecs: 0, totalFocus: 0, count: 0 };
    map.set(s.subject, {
      totalSecs: prev.totalSecs + s.duration,
      totalFocus: prev.totalFocus + s.focusScore,
      count: prev.count + 1,
    });
  });

  return Array.from(map.entries())
    .map(([subject, data]) => ({
      subject,
      totalMinutes: Math.round(data.totalSecs / 60),
      avgFocus: Math.round((data.totalFocus / data.count) * 10) / 10,
      sessionCount: data.count,
      color: SUBJECT_COLORS[subject] ?? '#6B7280',
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function calcWeeklyTrend(sessions: StudySession[]): DailyData[] {
  const map = new Map<string, { totalFocus: number; totalSecs: number; count: number }>();

  const today = new Date();
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push(key);
    map.set(key, { totalFocus: 0, totalSecs: 0, count: 0 });
  }

  sessions.forEach((s) => {
    if (map.has(s.date)) {
      const prev = map.get(s.date)!;
      map.set(s.date, {
        totalFocus: prev.totalFocus + s.focusScore,
        totalSecs: prev.totalSecs + s.duration,
        count: prev.count + 1,
      });
    }
  });

  return days.map((date) => {
    const data = map.get(date)!;
    const [, mm, dd] = date.split('-');
    return {
      date: `${mm}/${dd}`,
      avgFocus: data.count > 0 ? Math.round((data.totalFocus / data.count) * 10) / 10 : 0,
      totalMinutes: Math.round(data.totalSecs / 60),
      sessionCount: data.count,
    };
  });
}

export function calcMonthlyCalendar(
  sessions: StudySession[],
  year: number,
  month: number // 1~12
): { day: number; totalMinutes: number }[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const totalSecs = sessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.duration, 0);
    return { day, totalMinutes: Math.round(totalSecs / 60) };
  });
}

export function getTodaySessions(sessions: StudySession[]): StudySession[] {
  const today = new Date().toISOString().split('T')[0];
  return sessions.filter((s) => s.date === today).sort((a, b) => a.createdAt - b.createdAt);
}

export function calcSummary(sessions: StudySession[]): StudySummary {
  if (sessions.length === 0) {
    return {
      totalMinutes: 0,
      avgFocus: 0,
      sessionCount: 0,
      topHour: -1,
      worstHour: -1,
      bestSubject: '-',
      bestStudyType: '-',
    };
  }

  const hourlyData = calcHourlyData(sessions).filter((h) => h.sessionCount > 0);
  const subjectData = calcSubjectData(sessions);

  const topHourData = [...hourlyData].sort((a, b) => b.avgFocus - a.avgFocus)[0];
  const worstHourData = [...hourlyData].sort((a, b) => a.avgFocus - b.avgFocus)[0];

  const typeMap = new Map<string, { totalFocus: number; count: number }>();
  sessions.forEach((s) => {
    const prev = typeMap.get(s.studyType) ?? { totalFocus: 0, count: 0 };
    typeMap.set(s.studyType, { totalFocus: prev.totalFocus + s.focusScore, count: prev.count + 1 });
  });
  const bestType = Array.from(typeMap.entries()).sort(
    (a, b) => b[1].totalFocus / b[1].count - a[1].totalFocus / a[1].count
  )[0];

  const totalSecs = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgFocus = sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length;

  return {
    totalMinutes: Math.round(totalSecs / 60),
    avgFocus: Math.round(avgFocus * 10) / 10,
    sessionCount: sessions.length,
    topHour: topHourData?.hour ?? -1,
    worstHour: worstHourData?.hour ?? -1,
    bestSubject: subjectData[0]?.subject ?? '-',
    bestStudyType: bestType?.[0] ?? '-',
  };
}
