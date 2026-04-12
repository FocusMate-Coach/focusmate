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

## 3. 디자인 시스템

### 3.1 컬러 팔레트

| 역할 | 색상 | 코드 |
|------|------|------|
| 배경 | 따뜻한 크림 | `#F2EAE0` |
| 포인트 (퍼플) | 메인 액션, 강조 | `#9B8EC7` |
| 포인트 (민트) | 차트, 강점 카드 | `#B4D3D9` |
| 포인트 (연보라) | 테두리, 개선 카드 | `#BDA6CE` |

### 3.2 디자인 원칙
- **글라스모피즘**: `bg-white/80 backdrop-blur-xl border border-[#BDA6CE]/30`
- **배경 글로우**: 민트/퍼플 블러 원형 (`blur-[100px]`, `animate-float`)
- **애니메이션**: `animate-fade-in-up` (페이지 진입), `animate-float` (배경)
- **라운드**: 카드 `rounded-[2rem]~[2.5rem]`, 버튼 `rounded-full~rounded-2xl`

### 3.3 반응형 네비게이션
- **모바일**: 하단 고정 탭바 (`fixed bottom-0`)
- **PC**: 상단 중앙 pill 형태 네비게이션 (`fixed top-6`, `rounded-full`)

---

## 4. 데이터 모델

### 4.1 StudySession (학습 세션)
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

### 4.2 Subject (과목)
```typescript
type Subject = '국어' | '영어' | '수학' | '과학' | '사회' | '기타';
```

### 4.3 StudyType (학습 유형)
```typescript
type StudyType = '개념학습' | '문제풀이' | '복습' | '인강시청' | '오답노트';
```

### 4.4 HourlyData (시간대별 집계)
```typescript
interface HourlyData {
  hour: number;
  avgFocus: number;
  totalDuration: number;
  sessionCount: number;
}
```

### 4.5 SubjectData (과목별 집계)
```typescript
interface SubjectData {
  subject: string;
  totalMinutes: number;
  avgFocus: number;
  sessionCount: number;
}
```

---

## 5. 컴포넌트 설계

### 5.1 컴포넌트 트리
```
App
├── Layout (반응형 네비게이션)
│   ├── 상단 pill nav (PC)
│   ├── 하단 탭바 (모바일)
│   └── Main Content
│       ├── Route "/" → TimerPage
│       │   ├── Timer (대형 시계 디스플레이)
│       │   │   └── Dock (과목/유형 선택 + 컨트롤 버튼)
│       │   └── FocusRating (모달)
│       ├── Route "/dashboard" → DashboardPage
│       │   ├── SummaryCards (4종)
│       │   ├── HourlyFocusChart (바 차트)
│       │   └── WeeklyTrendChart (라인 차트)
│       └── Route "/feedback" → AIFeedbackPage
│           ├── GenerateButton
│           ├── LoadingSpinner
│           └── FeedbackResult
│               ├── StrengthCard (민트)
│               ├── ImprovementCard (연보라)
│               └── RecommendationCards (3개)
```

### 5.2 주요 컴포넌트 책임

| 컴포넌트 | 책임 | Props |
|---------|------|-------|
| `Timer` | 스톱워치 로직, 세션 저장 트리거 | `onSessionSaved` |
| `FocusRating` | 집중도 입력 UI, 저장 | `subject`, `studyType`, `duration`, `onSave`, `onCancel` |
| `Dashboard` | 데이터 집계 및 차트 조합 | `sessions`, `onClearData` |
| `AIFeedback` | OpenAI API 호출, 결과 렌더링 | `sessions` |

---

## 6. 주요 로직 설계

### 6.1 타이머 로직 (useTimer Hook)
```
상태: idle → running → paused → stopped
                ↑__________|

- running: setInterval(1000ms)로 elapsed 증가
- paused: interval 클리어, elapsed 유지
- stopped: interval 클리어, onStop 콜백 호출
- 최소 5초 미만 정지 시 세션 저장 안 함
```

### 6.2 데이터 분석 로직

```typescript
// 시간대별 평균 집중도 계산
function calcHourlyData(sessions: StudySession[]): HourlyData[]

// 과목별 통계 집계
function calcSubjectData(sessions: StudySession[]): SubjectData[]

// 7일 추이 계산 (일별 평균 집중도)
function calcWeeklyTrend(sessions: StudySession[]): DailyData[]

// 전체 요약 (최고 집중 시간대, 효율 최고 과목 포함)
function calcSummary(sessions: StudySession[]): SummaryData
```

### 6.3 차트 색상 로직 (집중도 기반)
```typescript
function focusColor(score: number): string {
  if (score >= 4.5) return 'url(#colorHigh)';  // 민트 그라데이션
  if (score >= 3.5) return 'url(#colorMid)';   // 퍼플 그라데이션
  if (score >= 2.5) return '#E4DFB5';          // 노랑
  return '#FBE8CE';                             // 크림
}
```

### 6.4 AI 피드백 프롬프트 구조

```
[시스템 프롬프트]
당신은 학습 패턴 분석 전문 AI 코치입니다.

[유저 메시지]
▶ 총 학습 시간 / 총 세션 수 / 평균 집중도
▶ 집중도 상위 시간대 (상위 3개)
▶ 집중도 하위 시간대 (하위 2개)
▶ 과목별 학습 시간 및 평균 집중도
▶ 학습 유형별 평균 집중도

[출력 형식]
## 학습 강점
- [강점 1], [강점 2]

## 개선 포인트
- [개선점 1]

## 맞춤 학습 추천
1. [제목]: [방법]
2. [제목]: [방법]
3. [제목]: [방법]
```

---

## 7. 로컬 스토리지 설계

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

## 8. API 설계 (OpenAI API 연동)

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

## 9. Mock Data 설계

공모전 시연을 위해 실제 사용 데이터처럼 보이는 7일치 가상 데이터를 생성합니다.

### Mock Data 생성 규칙
- 오전 10~12시: 수학 문제풀이, 집중도 4~5 (고집중 패턴)
- 오후 2~4시: 영어 개념학습, 집중도 3~4
- 저녁 8~10시: 집중도 2~3 (저집중 패턴)
- 총 세션 수: 30~40개 (7일 x 4~6세션)

→ AI가 "오전 시간대 고난도 문제 집중 배치"와 "저녁 시간 가벼운 복습 추천" 피드백을 자연스럽게 생성하도록 설계

---

## 10. 상태 관리 전략

별도의 상태 관리 라이브러리(Redux, Zustand) 없이 React 기본 훅만 사용합니다.

- `useState`: 컴포넌트 로컬 상태 (타이머, 모달 표시)
- `useEffect`: 타이머 interval, 데이터 로드
- `useMemo`: 차트 데이터 계산 (sessions 변경 시만 재계산)
- 전역 상태(sessions): App 컴포넌트에서 관리 후 Props로 전달
- Props Drilling: 최대 2단계까지만 허용

---

## 11. 브랜치 전략

```
main                ← 최종 배포
└── develop         ← 통합 테스트
    ├── feature/input       # Timer.tsx, FocusRating.tsx, useTimer.ts, storage.ts
    ├── feature/plan        # 신규 개발 (공부 계획 생성)
    ├── feature/analysis    # Dashboard.tsx, dataAnalysis.ts, mockData.ts
    └── feature/ai-feedback # AIFeedback.tsx
```

**공통 파일 (충돌 주의)**
- `App.tsx` — 라우팅 추가 시 수정 필요
- `Layout.tsx` — 네비게이션 메뉴 변경 시
- `types/index.ts` — 새 타입 추가 시
