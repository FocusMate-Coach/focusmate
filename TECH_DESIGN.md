# 기술 설계서 (Technical Design Document)
# FocusMate v1.0.0

---

## 1. 기술 스택 선택 근거

| 기술 | 선택 이유 |
|------|----------|
| **React + TypeScript** | 컴포넌트 재사용성, 타입 안전성, 빠른 개발 속도 |
| **Vite** | 빠른 HMR, 가벼운 번들 크기, React 공식 권장 빌드 도구 |
| **Tailwind CSS** | 유틸리티 클래스 방식으로 빠른 스타일링, 반응형 쉽게 적용 |
| **Recharts** | React 친화적, 선언형 차트, 커스터마이징 용이 |
| **OpenAI GPT-4o-mini API** | 경량 모델, 한국어 지원 우수, 비용 효율적 |
| **localStorage** | 백엔드 없이 데이터 지속성 확보, MVP에 적합 |
| **React Router v6** | 표준 SPA 라우팅, 페이지 전환 구현 |

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │              React Application               │   │
│  │                                              │   │
│  │  ┌─────────┐  ┌───────────┐  ┌───────────┐  │   │
│  │  │  Timer  │  │ Dashboard │  │AI Feedback│  │   │
│  │  │  Page   │  │   Page    │  │   Page    │  │   │
│  │  └────┬────┘  └─────┬─────┘  └─────┬─────┘  │   │
│  │       │             │               │        │   │
│  │  ┌────▼─────────────▼───────────────▼─────┐  │   │
│  │  │           Shared State (Props/Context)  │  │   │
│  │  └────┬─────────────────────────────┬─────┘  │   │
│  │       │                             │        │   │
│  │  ┌────▼────┐                  ┌─────▼──────┐  │   │
│  │  │ Storage │                  │  Analysis  │  │   │
│  │  │  Utils  │                  │   Utils    │  │   │
│  │  └────┬────┘                  └────────────┘  │   │
│  └───────┼──────────────────────────────────────┘   │
│          │                                           │
│  ┌───────▼────────┐          ┌────────────────────┐  │
│  │  localStorage  │          │  OpenAI API        │  │
│  │  (세션 데이터)  │          │  (GPT-4o-mini)     │  │
│  └────────────────┘          └────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. 데이터 모델

### 3.1 StudySession (학습 세션)
```typescript
interface StudySession {
  id: string;           // UUID
  date: string;         // "YYYY-MM-DD"
  startTime: string;    // "HH:mm"
  endTime: string;      // "HH:mm"
  hour: number;         // 0~23 (시간대 분석용)
  subject: Subject;     // 과목
  studyType: StudyType; // 학습 유형
  duration: number;     // 초(seconds) 단위
  focusScore: number;   // 1~5
  createdAt: number;    // timestamp
}
```

### 3.2 Subject (과목 Enum)
```typescript
type Subject = '국어' | '영어' | '수학' | '과학' | '사회' | '기타';
```

### 3.3 StudyType (학습 유형 Enum)
```typescript
type StudyType = '개념학습' | '문제풀이' | '복습' | '인강시청' | '오답노트';
```

### 3.4 HourlyData (시간대별 집계)
```typescript
interface HourlyData {
  hour: number;         // 0~23
  avgFocus: number;     // 평균 집중도
  totalDuration: number; // 총 공부 시간(분)
  sessionCount: number; // 세션 수
}
```

### 3.5 SubjectData (과목별 집계)
```typescript
interface SubjectData {
  subject: string;
  totalDuration: number; // 분
  avgFocus: number;
  sessionCount: number;
}
```

---

## 4. 컴포넌트 설계

### 4.1 컴포넌트 트리
```
App
├── Layout
│   ├── Sidebar (네비게이션)
│   └── Main Content
│       ├── Route "/" → TimerPage
│       │   ├── SubjectSelector
│       │   ├── Timer
│       │   └── TodaySessionList
│       ├── Route "/dashboard" → DashboardPage
│       │   ├── SummaryCards
│       │   ├── HourlyFocusChart
│       │   ├── SubjectChart
│       │   ├── WeeklyTrendChart
│       │   └── SessionTimeline
│       └── Route "/feedback" → AIFeedbackPage
│           ├── DataSummary
│           ├── GenerateButton
│           └── FeedbackResult
│               ├── StrengthCard
│               ├── WeaknessCard
│               └── RecommendationCards
```

### 4.2 주요 컴포넌트 책임

| 컴포넌트 | 책임 | Props |
|---------|------|-------|
| `Timer` | 스톱워치 로직, 세션 저장 트리거 | `onSessionEnd` |
| `FocusRatingModal` | 집중도 입력 UI, 저장 | `session`, `onSave`, `onClose` |
| `Dashboard` | 데이터 집계 및 차트 조합 | `sessions` |
| `AIFeedback` | OpenAI API 호출, 결과 렌더링 | `sessions` |

---

## 5. 주요 로직 설계

### 5.1 타이머 로직 (useTimer Hook)
```
상태: idle → running → paused → stopped
                ↑__________|

- running: setInterval(1000ms)로 elapsed 증가
- paused: interval 클리어, elapsed 유지
- stopped: interval 클리어, onStop 콜백 호출
```

### 5.2 데이터 분석 로직

```typescript
// 시간대별 평균 집중도 계산
function calcHourlyData(sessions: StudySession[]): HourlyData[]

// 과목별 통계 집계
function calcSubjectData(sessions: StudySession[]): SubjectData[]

// 7일 추이 계산 (일별 평균 집중도)
function calcWeeklyTrend(sessions: StudySession[]): DailyData[]

// 효율 점수 계산 (집중도 × 시간 가중치)
function calcEfficiencyScore(session: StudySession): number
```

### 5.3 AI 피드백 프롬프트 구조

```
[시스템 프롬프트]
당신은 학습 패턴 분석 전문 AI 코치입니다.
학생의 학습 데이터를 분석하여 구체적이고 실행 가능한 피드백을 제공합니다.

[유저 메시지]
다음은 [학생명]의 최근 7일 학습 데이터입니다:

▶ 총 학습 시간: N시간 M분
▶ 평균 집중도: X.X / 5.0
▶ 최고 집중 시간대: HH시 ~ HH시 (평균 X.X점)
▶ 최저 집중 시간대: HH시 ~ HH시 (평균 X.X점)
▶ 가장 효율적인 과목: [과목] (평균 X.X점)
▶ 학습 유형별 집중도: [유형: X.X점, ...]

위 데이터를 바탕으로 다음 형식으로 피드백을 제공해 주세요:
1. 학습 강점 (2가지)
2. 개선이 필요한 부분 (1가지)
3. 구체적 행동 추천 (3가지, 각 시간대/방법 명시)

응답은 한국어로, 학생이 바로 실천할 수 있도록 친근하고 구체적으로 작성해 주세요.
```

---

## 6. 로컬 스토리지 설계

| 키 | 타입 | 설명 |
|----|------|------|
| `focusmate_sessions` | `StudySession[]` | 전체 학습 세션 목록 |
| `focusmate_mock_loaded` | `boolean` | Mock 데이터 주입 여부 |

```typescript
// 저장
localStorage.setItem('focusmate_sessions', JSON.stringify(sessions));

// 로드
const raw = localStorage.getItem('focusmate_sessions');
const sessions = raw ? JSON.parse(raw) : [];
```

---

## 7. API 설계 (OpenAI API 연동)

### 요청
```typescript
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 데모용
});

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  max_tokens: 1024,
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ],
});
```

### 응답 처리
```typescript
const feedbackText = response.choices[0].message.content ?? '';
```

---

## 8. Mock Data 설계

공모전 시연을 위해 실제 사용 데이터처럼 보이는 7일치 가상 데이터를 생성합니다.

### Mock Data 생성 규칙
- 오전 10~12시: 수학 문제풀이, 집중도 4~5 (고집중 패턴)
- 오후 2~4시: 영어 개념학습, 집중도 3~4
- 저녁 8~10시: 집중도 2~3 (저집중 패턴)
- 총 세션 수: 30~40개 (7일 x 4~6세션)

→ AI가 "오전 시간대 고난도 문제 집중 배치"와 "저녁 시간 가벼운 복습 추천" 피드백을 자연스럽게 생성하도록 설계

---

## 9. 상태 관리 전략

별도의 상태 관리 라이브러리(Redux, Zustand) 없이 React 기본 훅만 사용합니다.

- `useState`: 컴포넌트 로컬 상태 (타이머, 모달 표시)
- `useEffect`: 타이머 interval, 데이터 로드
- Props Drilling: 최대 2단계까지만 허용
- 전역 상태(sessions): App 컴포넌트에서 관리 후 Props로 전달

---

## 10. 성능 고려사항

- `useMemo`: 차트 데이터 계산 (sessions 변경 시만 재계산)
- `useCallback`: 이벤트 핸들러 메모이제이션
- Mock Data: 앱 로드 시 한 번만 주입 (중복 방지 플래그)
- Chart Lazy Loading: 대시보드 탭 진입 시에만 렌더링
