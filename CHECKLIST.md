# 개발 체크리스트 (Development Checklist)
# FocusMate MVP - 2일 스프린트

---

## 📅 Day 1 목표: 핵심 기능 구현

### ✅ 환경 설정 (30분)
- [ ] Node.js 설치 확인 (`node -v`)
- [ ] 프로젝트 의존성 설치 (`npm install`)
- [ ] `.env` 파일 생성 및 API 키 입력
- [ ] 개발 서버 실행 확인 (`npm run dev`)
- [ ] Tailwind CSS 동작 확인

### ✅ 타입 및 기초 설정 (30분)
- [ ] `src/types/index.ts` — StudySession, Subject, StudyType 타입 정의
- [ ] `src/utils/storage.ts` — localStorage CRUD 함수 구현
- [ ] `src/data/mockData.ts` — 7일치 가상 데이터 생성 함수 구현

### ✅ 레이아웃 & 라우팅 (30분)
- [ ] `src/App.tsx` — React Router 라우팅 설정 (/, /dashboard, /feedback)
- [ ] `src/components/Layout/Layout.tsx` — 사이드바 + 메인 콘텐츠 레이아웃
- [ ] 사이드바 네비게이션 링크 (타이머/대시보드/AI피드백)
- [ ] 모바일 반응형 레이아웃 확인

### ✅ 타이머 기능 (1.5시간)
- [ ] `src/hooks/useTimer.ts` — 타이머 커스텀 훅 구현
  - [ ] start / pause / resume / stop 상태 전환
  - [ ] setInterval 기반 elapsed time 카운팅
  - [ ] cleanup (컴포넌트 언마운트 시 interval 제거)
- [ ] `src/components/Timer/Timer.tsx` — 타이머 UI
  - [ ] 과목 선택 드롭다운
  - [ ] 학습 유형 선택 드롭다운
  - [ ] 시:분:초 표시 (크게, 눈에 잘 띄게)
  - [ ] 시작 / 일시정지 / 정지 버튼
  - [ ] 현재 과목 표시 배지

### ✅ 집중도 평가 모달 (1시간)
- [ ] `src/components/FocusRating/FocusRating.tsx`
  - [ ] 타이머 정지 시 자동 표시 (state 기반)
  - [ ] 1~5점 이모티콘 선택 UI (😴😕😐😊🔥)
  - [ ] 선택 시 하이라이트 효과
  - [ ] 저장 버튼 → localStorage에 세션 저장
  - [ ] 취소 버튼 → 세션 미저장 처리

### ✅ 데이터 분석 유틸리티 (1시간)
- [ ] `src/utils/dataAnalysis.ts`
  - [ ] `calcHourlyData()` — 시간대별 평균 집중도
  - [ ] `calcSubjectData()` — 과목별 통계
  - [ ] `calcWeeklyTrend()` — 7일 추이
  - [ ] `getTodaySessions()` — 오늘 세션 필터링
  - [ ] `getTopHour()` — 최고 집중 시간대
  - [ ] `getWorstHour()` — 최저 집중 시간대

---

## 📅 Day 2 목표: 대시보드 + AI 피드백 + 마감

### ✅ 대시보드 (2시간)
- [ ] `src/components/Dashboard/Dashboard.tsx`
  - [ ] 요약 카드 (총 학습 시간, 평균 집중도, 총 세션 수)
  - [ ] 시간대별 집중도 바 차트 (Recharts BarChart)
    - [ ] X축: 0~23시, Y축: 집중도 0~5
    - [ ] 집중도에 따른 색상 그라데이션
  - [ ] 과목별 학습 시간 바 차트 (Recharts BarChart)
  - [ ] 7일 집중도 추이 라인 차트 (Recharts LineChart)
  - [ ] 오늘의 세션 타임라인 목록
  - [ ] 데이터 초기화 버튼 (Mock Data 재주입)
- [ ] Mock Data 자동 주입 로직 확인 (첫 방문 시)

### ✅ AI 피드백 (1.5시간)
- [ ] `src/components/AIFeedback/AIFeedback.tsx`
  - [ ] 현재 학습 데이터 요약 카드 표시
  - [ ] "AI 분석 시작" 버튼
  - [ ] 로딩 스피너 / 스켈레톤 UI
  - [ ] Claude API 호출 함수 구현
    - [ ] 분석 데이터를 프롬프트로 포맷팅
    - [ ] `@anthropic-ai/sdk` 사용
    - [ ] 에러 핸들링 (API 실패 시 메시지)
  - [ ] 피드백 결과 렌더링
    - [ ] 강점 카드 (초록색)
    - [ ] 개선점 카드 (주황색)
    - [ ] 추천 행동 카드 3개 (파란색)

### ✅ UI 마무리 & 폴리싱 (1시간)
- [ ] 전체 색상 테마 통일 (다크 테마)
- [ ] 반응형 레이아웃 최종 확인 (모바일/태블릿/데스크탑)
- [ ] 빈 상태(Empty State) UI — 데이터가 없을 때 안내 메시지
- [ ] 로딩 상태 처리 확인
- [ ] 폰트 크기 및 간격 일관성 확인
- [ ] 애니메이션/트랜지션 추가 (hover, click 효과)

### ✅ 테스트 & 마감 준비 (30분)
- [ ] 전체 기능 E2E 시나리오 테스트
  - [ ] 타이머 시작 → 정지 → 집중도 평가 → 저장
  - [ ] 대시보드에서 데이터 반영 확인
  - [ ] AI 피드백 생성 및 결과 표시
- [ ] 브라우저 새로고침 후 데이터 유지 확인
- [ ] `npm run build` 빌드 오류 없는지 확인
- [ ] README.md 최종 검토

---

## 🚨 버그 체크리스트

- [ ] 타이머 중복 실행 방지 (빠른 클릭 시)
- [ ] 집중도 미선택 시 저장 버튼 비활성화
- [ ] API 키 미설정 시 명확한 에러 메시지
- [ ] 빈 데이터로 차트 렌더링 오류 없는지 확인
- [ ] 모달 외부 클릭 시 닫힘 동작 확인
- [ ] 타이머 0초에서 음수로 가지 않는지 확인

---

## 📊 우선순위 매트릭스

| 기능 | 중요도 | 개발 난이도 | 우선순위 |
|------|--------|------------|---------|
| 타이머 | 높음 | 낮음 | **P0** |
| 집중도 모달 | 높음 | 낮음 | **P0** |
| 데이터 저장 | 높음 | 낮음 | **P0** |
| AI 피드백 | 높음 | 중간 | **P1** |
| 대시보드 차트 | 중간 | 중간 | **P1** |
| 반응형 UI | 중간 | 낮음 | **P2** |
| 애니메이션 | 낮음 | 낮음 | **P3** |

---

## 📝 완료 기준 (Definition of Done)

공모전 시연 시 다음을 모두 시연할 수 있어야 합니다:

1. **타이머 시연**: 과목 선택 → 타이머 시작 → 정지 → 집중도 5점 입력 → 저장
2. **대시보드 시연**: 가상 데이터 기반 3가지 차트 표시 및 요약 카드
3. **AI 피드백 시연**: 버튼 클릭 → 로딩 → 맞춤형 피드백 3가지 표시
