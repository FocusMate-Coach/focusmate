# 개발 체크리스트 (Development Checklist)
# FocusMate MVP - 2일 스프린트

---

## 📅 Day 1 목표: 핵심 기능 구현

### ✅ 환경 설정
- [x] Node.js 설치 확인 (`node -v`)
- [x] 프로젝트 의존성 설치 (`npm install`)
- [x] `.env` 파일 생성 및 OpenAI API 키 입력
- [x] 개발 서버 실행 확인 (`npm run dev`)
- [x] Tailwind CSS 동작 확인
- [x] `src/vite-env.d.ts` — Vite 환경변수 타입 선언 추가

### ✅ 타입 및 기초 설정
- [x] `src/types/index.ts` — StudySession, Subject, StudyType 타입 정의
- [x] `src/utils/storage.ts` — localStorage CRUD 함수 구현
- [x] `src/data/mockData.ts` — 7일치 가상 데이터 생성 함수 구현

### ✅ 레이아웃 & 라우팅
- [x] `src/App.tsx` — React Router 라우팅 설정 (/, /dashboard, /feedback)
- [x] `src/components/Layout/Layout.tsx` — 반응형 네비게이션 레이아웃
  - [x] PC: 상단 pill 형태 네비게이션 (중앙 고정)
  - [x] 모바일: 하단 탭바 (fixed bottom)
  - [x] 배경 글로우 이펙트 (민트 & 퍼플 블러)
  - [x] 네비게이션 메뉴: Timer / Analytics / AI Coach

### ✅ 타이머 기능
- [x] `src/hooks/useTimer.ts` — 타이머 커스텀 훅 구현
  - [x] start / pause / resume / stop 상태 전환
  - [x] setInterval 기반 elapsed time 카운팅
  - [x] cleanup (컴포넌트 언마운트 시 interval 제거)
- [x] `src/components/Timer/Timer.tsx` — 타이머 UI
  - [x] 과목 선택 드롭다운 (Dock 내부)
  - [x] 학습 유형 선택 드롭다운 (Dock 내부)
  - [x] 반응형 대형 시:분:초 표시 (18vw ~ 11rem)
  - [x] 시작 / 일시정지 / 정지 버튼 (Dock 스타일)
  - [x] 상태 표시 레이블 (Deep Work in Progress / Ready to Focus)
  - [x] 최소 5초 미만 정지 방지

### ✅ 집중도 평가 모달
- [x] `src/components/FocusRating/FocusRating.tsx`
  - [x] 타이머 정지 시 자동 표시 (state 기반)
  - [x] 1~5점 이모티콘 선택 UI (😴😕😐😊🔥)
  - [x] 선택 시 하이라이트 효과
  - [x] 저장 버튼 → localStorage에 세션 저장
  - [x] 취소 버튼 → 세션 미저장 처리

### ✅ 데이터 분석 유틸리티
- [x] `src/utils/dataAnalysis.ts`
  - [x] `calcHourlyData()` — 시간대별 평균 집중도
  - [x] `calcSubjectData()` — 과목별 통계
  - [x] `calcWeeklyTrend()` — 7일 추이
  - [x] `calcSummary()` — 총합 요약 (최고 시간대, 최고 과목 포함)

---

## 📅 Day 2 목표: 대시보드 + AI 피드백 + 마감

### ✅ 대시보드
- [x] `src/components/Dashboard/Dashboard.tsx`
  - [x] 요약 카드 4종 (총 학습 시간 / 평균 집중도 / 최고 집중 시간대 / 효율 최고 과목)
  - [x] 시간대별 집중도 바 차트 (Recharts BarChart)
    - [x] 집중도에 따른 색상 그라데이션 (민트/퍼플/노랑/크림)
  - [x] 7일 집중도 추이 라인 차트 (Recharts LineChart)
  - [x] 데이터 초기화 버튼
  - [x] 빈 상태 UI
- [x] Mock Data 자동 주입 로직 확인 (첫 방문 시)

### ✅ AI 피드백
- [x] `src/components/AIFeedback/AIFeedback.tsx`
  - [x] "초개인화 AI 리포트 생성하기" 버튼
  - [x] 로딩 스피너 UI
  - [x] OpenAI API 호출 함수 구현 (`openai` SDK)
    - [x] 분석 데이터를 프롬프트로 포맷팅
    - [x] 에러 핸들링 (API 실패 시 메시지)
  - [x] 피드백 결과 렌더링
    - [x] 강점 카드 (민트 #B4D3D9)
    - [x] 개선점 카드 (퍼플 #BDA6CE)
    - [x] 추천 행동 카드 3개
  - [x] 재분석 버튼

### ✅ UI 마무리 & 폴리싱
- [x] 전체 색상 테마 통일 (따뜻한 크림 테마 #F2EAE0)
- [x] 컬러 팔레트: 퍼플 #9B8EC7 / 민트 #B4D3D9 / 연보라 #BDA6CE
- [x] 글라스모피즘 디자인 (bg-white/80, backdrop-blur-xl)
- [x] 반응형 레이아웃 최종 확인 (모바일/태블릿/데스크탑)
- [x] 빈 상태(Empty State) UI — 데이터가 없을 때 안내 메시지
- [x] 로딩 상태 처리 확인
- [x] 애니메이션/트랜지션 추가 (animate-fade-in-up, animate-float)

### ✅ 테스트 & 마감 준비
- [ ] 전체 기능 E2E 시나리오 테스트
  - [ ] 타이머 시작 → 정지 → 집중도 평가 → 저장
  - [ ] 대시보드에서 데이터 반영 확인
  - [ ] AI 피드백 생성 및 결과 표시
- [ ] 브라우저 새로고침 후 데이터 유지 확인
- [ ] `npm run build` 빌드 오류 없는지 확인
- [ ] README.md 최종 검토

---

## 🚨 버그 체크리스트

- [x] 타이머 5초 미만 정지 방지
- [ ] 집중도 미선택 시 저장 버튼 비활성화
- [x] API 키 미설정 시 명확한 에러 메시지
- [x] 빈 데이터로 차트 렌더링 오류 없는지 확인
- [ ] 모달 외부 클릭 시 닫힘 동작 확인

---

## 📊 우선순위 매트릭스

| 기능 | 중요도 | 개발 난이도 | 우선순위 | 상태 |
|------|--------|------------|---------|------|
| 타이머 | 높음 | 낮음 | **P0** | ✅ 완료 |
| 집중도 모달 | 높음 | 낮음 | **P0** | ✅ 완료 |
| 데이터 저장 | 높음 | 낮음 | **P0** | ✅ 완료 |
| AI 피드백 | 높음 | 중간 | **P1** | ✅ 완료 |
| 대시보드 차트 | 중간 | 중간 | **P1** | ✅ 완료 |
| 반응형 UI | 중간 | 낮음 | **P2** | ✅ 완료 |
| 애니메이션 | 낮음 | 낮음 | **P3** | ✅ 완료 |
| 공부 계획 기능 | 중간 | 중간 | **P2** | 🔲 미구현 |

---

## 📝 완료 기준 (Definition of Done)

공모전 시연 시 다음을 모두 시연할 수 있어야 합니다:

1. **타이머 시연**: 과목 선택 → 타이머 시작 → 정지 → 집중도 5점 입력 → 저장
2. **대시보드 시연**: 가상 데이터 기반 2가지 차트 + 요약 카드 4종 표시
3. **AI 피드백 시연**: 버튼 클릭 → 로딩 → 맞춤형 피드백 3가지 표시

---

## 🌿 브랜치 전략

```
main                ← 최종 배포
└── develop         ← 통합 테스트
    ├── feature/input       # 타이머 + 집중도 평가 (공부 기록 입력)
    ├── feature/plan        # 공부 계획 생성 (신규 개발)
    ├── feature/analysis    # 대시보드 + 데이터 분석
    └── feature/ai-feedback # AI 피드백
```
