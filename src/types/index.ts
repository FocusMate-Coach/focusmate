export type Subject = '국어' | '영어' | '수학' | '과학' | '사회' | '기타';

export type StudyType = '개념학습' | '문제풀이' | '복습' | '인강시청' | '오답노트';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface StudySession {
  id: string;
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  hour: number;        // 0~23
  subject: Subject;
  studyType: StudyType;
  duration: number;    // seconds
  focusScore: number;  // 1~5
  createdAt: number;   // timestamp
}

export interface HourlyData {
  hour: number;
  label: string;       // "오전 10시"
  avgFocus: number;
  totalMinutes: number;
  sessionCount: number;
}

export interface SubjectData {
  subject: string;
  totalMinutes: number;
  avgFocus: number;
  sessionCount: number;
  color: string;
}

export interface DailyData {
  date: string;        // "MM/DD"
  avgFocus: number;
  totalMinutes: number;
  sessionCount: number;
}

export interface StudySummary {
  totalMinutes: number;
  avgFocus: number;
  sessionCount: number;
  topHour: number;
  worstHour: number;
  bestSubject: string;
  bestStudyType: string;
}

export interface AIFeedbackResult {
  strengths: string[];
  improvements: string[];
  recommendations: Array<{
    title: string;
    description: string;
    timeHint?: string;
  }>;
  rawText: string;
}
