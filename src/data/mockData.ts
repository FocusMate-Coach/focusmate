import type { StudySession, Subject, StudyType } from '../types';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// 시간대별 집중도 패턴 정의 (현실적인 데이터 시뮬레이션)
const HOUR_FOCUS_PATTERN: Record<number, [number, number]> = {
  // [min, max] 집중도 범위
  6:  [3, 4],
  7:  [3, 5],
  8:  [4, 5],
  9:  [4, 5],
  10: [4, 5],  // 오전 고집중 골든타임
  11: [4, 5],
  12: [2, 3],  // 점심 후 슬럼프
  13: [2, 4],
  14: [3, 5],  // 오후 집중 회복
  15: [4, 5],
  16: [3, 4],
  17: [3, 4],
  18: [2, 3],  // 저녁 집중 하락
  19: [2, 3],
  20: [1, 3],  // 밤 저집중
  21: [1, 3],
  22: [1, 2],
};

interface SessionTemplate {
  hour: number;
  subject: Subject;
  studyType: StudyType;
  durationRange: [number, number]; // seconds
}

const TEMPLATES: SessionTemplate[] = [
  { hour: 9,  subject: '수학', studyType: '개념학습',  durationRange: [1800, 3600] },
  { hour: 10, subject: '수학', studyType: '문제풀이',  durationRange: [2400, 4800] },
  { hour: 11, subject: '영어', studyType: '개념학습',  durationRange: [1800, 3000] },
  { hour: 14, subject: '영어', studyType: '문제풀이',  durationRange: [1800, 3600] },
  { hour: 15, subject: '수학', studyType: '문제풀이',  durationRange: [3000, 5400] },
  { hour: 16, subject: '국어', studyType: '문제풀이',  durationRange: [1800, 3600] },
  { hour: 19, subject: '과학', studyType: '복습',      durationRange: [1200, 2400] },
  { hour: 20, subject: '영어', studyType: '인강시청',  durationRange: [1800, 3600] },
  { hour: 21, subject: '수학', studyType: '오답노트',  durationRange: [1200, 1800] },
  { hour: 22, subject: '국어', studyType: '복습',      durationRange: [900,  1800] },
];

export function generateMockSessions(): StudySession[] {
  const sessions: StudySession[] = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    // 하루에 4~7개 세션 랜덤 선택
    const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
    const dayTemplates = shuffled.slice(0, randomBetween(4, 7));

    dayTemplates.forEach((tpl) => {
      const focusRange = HOUR_FOCUS_PATTERN[tpl.hour] ?? [2, 4];
      const focusScore = randomBetween(focusRange[0], focusRange[1]);
      const duration = randomBetween(tpl.durationRange[0], tpl.durationRange[1]);

      const startH = tpl.hour;
      const startM = randomBetween(0, 30);
      const endTotalMins = startH * 60 + startM + Math.round(duration / 60);
      const endH = Math.floor(endTotalMins / 60);
      const endM = endTotalMins % 60;

      const id = `mock_${daysAgo}_${tpl.hour}_${Math.random().toString(36).slice(2, 7)}`;

      sessions.push({
        id,
        date: dateStr(daysAgo),
        startTime: `${pad(startH)}:${pad(startM)}`,
        endTime: `${pad(endH % 24)}:${pad(endM)}`,
        hour: tpl.hour,
        subject: tpl.subject,
        studyType: tpl.studyType,
        duration,
        focusScore,
        createdAt: Date.now() - daysAgo * 86400000 + tpl.hour * 3600000,
      });
    });
  }

  return sessions.sort((a, b) => a.createdAt - b.createdAt);
}
