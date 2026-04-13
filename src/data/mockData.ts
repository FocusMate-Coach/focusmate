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

// 시간대별 집중도 패턴 정의
const HOUR_FOCUS_PATTERN: Record<number, [number, number]> = {
  6:  [3, 4],
  7:  [3, 5],
  8:  [4, 5],
  9:  [4, 5],
  10: [4, 5],
  11: [4, 5],
  12: [2, 3],
  13: [2, 4],
  14: [3, 5],
  15: [4, 5],
  16: [3, 4],
  17: [3, 4],
  18: [2, 3],
  19: [2, 3],
  20: [1, 3],
  21: [1, 3],
  22: [1, 2],
};

interface SessionTemplate {
  hour: number;
  subject: Subject;
  studyType: StudyType;
}

const TEMPLATES: SessionTemplate[] = [
  { hour: 9,  subject: '수학', studyType: '개념학습'  },
  { hour: 10, subject: '수학', studyType: '문제풀이'  },
  { hour: 11, subject: '영어', studyType: '개념학습'  },
  { hour: 14, subject: '영어', studyType: '문제풀이'  },
  { hour: 15, subject: '수학', studyType: '문제풀이'  },
  { hour: 16, subject: '국어', studyType: '문제풀이'  },
  { hour: 19, subject: '과학', studyType: '복습'      },
  { hour: 20, subject: '영어', studyType: '인강시청'  },
  { hour: 21, subject: '수학', studyType: '오답노트'  },
  { hour: 22, subject: '국어', studyType: '복습'      },
];

// 강도별 세션 수 & 1세션당 duration 범위(초)
// 목표 일일 총 학습시간:
//   0 = 휴식(0분)
//   1 = 10~25분 (lightest color)
//   2 = 30~55분
//   3 = 60~110분
//   4 = 120~170분
//   5 = 180분+ (darkest color)
const INTENSITY_CONFIG: Record<number, { sessions: number; durRange: [number, number] }> = {
  0: { sessions: 0, durRange: [0, 0] },
  1: { sessions: 1, durRange: [600,  1500] },   // 1세션 × ~10-25분
  2: { sessions: 2, durRange: [900,  1650] },   // 2세션 × ~15-28분 = 30~55분
  3: { sessions: 3, durRange: [1200, 2200] },   // 3세션 × ~20-37분 = 60~110분
  4: { sessions: 4, durRange: [1800, 2550] },   // 4세션 × ~30-43분 = 120~170분
  5: { sessions: 5, durRange: [2160, 3600] },   // 5세션 × ~36-60분 = 180~300분
};

// 날짜별 강도 패턴 (daysAgo 0=오늘, 큰 수=과거)
// 총 30일치 → 이번 달 전체 + 지난달 일부 커버
const INTENSITY_PATTERN: number[] = [
  4, 3, 0, 5, 2, 4, 1,   // daysAgo 0~6  (이번 달)
  0, 3, 5, 2, 4, 1, 0,   // daysAgo 7~13
  3, 5, 1, 4, 0, 2, 4,   // daysAgo 14~20 (지난달)
  0, 3, 1, 5, 2, 4, 0,   // daysAgo 21~27
  3, 2,                   // daysAgo 28~29
];

export function generateMockSessions(): StudySession[] {
  const sessions: StudySession[] = [];

  for (let daysAgo = INTENSITY_PATTERN.length - 1; daysAgo >= 0; daysAgo--) {
    const intensity = INTENSITY_PATTERN[daysAgo];
    const config = INTENSITY_CONFIG[intensity];
    if (config.sessions === 0) continue;

    const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
    const dayTemplates = shuffled.slice(0, config.sessions);

    dayTemplates.forEach((tpl) => {
      const focusRange = HOUR_FOCUS_PATTERN[tpl.hour] ?? [2, 4];
      const focusScore = randomBetween(focusRange[0], focusRange[1]);
      const duration = randomBetween(config.durRange[0], config.durRange[1]);

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
