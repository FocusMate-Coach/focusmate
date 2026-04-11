<<<<<<< HEAD
# FocusMate 🎯
### AI 기반 초개인화 학습 패턴 분석 코치

> 공부 시간이 아닌 **집중도**로 학습을 최적화하는 AI 학습 코치

---

## 📋 프로젝트 소개

FocusMate는 학생들이 학습 시간과 집중도 데이터를 기록하고, AI가 이를 분석하여 **나만의 최적화된 학습 패턴**을 찾아주는 웹 애플리케이션입니다.

### 핵심 기능
| 기능 | 설명 |
|------|------|
| ⏱️ 스마트 타이머 | 과목·학습유형별 공부 시간 측정 |
| 🎯 집중도 체크인 | 세션 종료 후 1~5점 자가 평가 |
| 📊 데이터 대시보드 | 시간대별·과목별 학습 효율 시각화 |
| 🤖 AI 피드백 | OpenAI GPT 기반 맞춤형 학습 방법 추천 |

---

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18.0.0 이상
- OpenAI API Key (platform.openai.com 에서 발급)

### 설치 및 실행

```bash
# 1. 저장소 클론 또는 디렉토리 이동
cd C:/Project/FocusMate

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정
# .env 파일을 열고 VITE_OPENAI_API_KEY에 본인의 API 키 입력

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 접속
# http://localhost:5173
```

### 빌드

```bash
npm run build
npm run preview
```

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 번들러 | Vite |
| 스타일링 | Tailwind CSS |
| 차트 | Recharts |
| AI | OpenAI API (gpt-4o-mini) |
| 데이터 저장 | localStorage |
| 라우팅 | React Router v6 |
| 아이콘 | Lucide React |

---

## 📁 프로젝트 구조

```
FocusMate/
├── src/
│   ├── components/
│   │   ├── Timer/          # 학습 타이머 컴포넌트
│   │   ├── FocusRating/    # 집중도 평가 모달
│   │   ├── Dashboard/      # 데이터 시각화 대시보드
│   │   ├── AIFeedback/     # AI 피드백 컴포넌트
│   │   └── Layout/         # 앱 레이아웃 (사이드바, 네비게이션)
│   ├── data/
│   │   └── mockData.ts     # 시연용 가상 데이터
│   ├── hooks/
│   │   └── useTimer.ts     # 타이머 커스텀 훅
│   ├── types/
│   │   └── index.ts        # TypeScript 타입 정의
│   ├── utils/
│   │   ├── storage.ts      # localStorage 유틸리티
│   │   └── dataAnalysis.ts # 데이터 분석 함수
│   ├── vite-env.d.ts       # Vite 환경변수 타입 선언
│   ├── index.css           # Tailwind CSS 진입점
│   ├── App.tsx
│   └── main.tsx
├── PRD.md                  # 제품 요구사항 문서
├── TECH_DESIGN.md          # 기술 설계서
├── CHECKLIST.md            # 개발 체크리스트
├── .env                    # 환경변수 (API 키 입력)
└── package.json
```

---

## 🎮 사용 방법

### 1단계: 공부 시작
1. 홈 화면에서 **과목**과 **학습 유형**을 선택합니다.
2. **시작** 버튼을 눌러 타이머를 시작합니다.
3. 공부가 끝나면 **정지** 버튼을 누릅니다.

### 2단계: 집중도 평가
1. 타이머 정지 시 **집중도 평가 모달**이 자동으로 나타납니다.
2. 1~5개의 이모티콘 중 현재 집중도를 선택합니다.
3. **저장** 버튼으로 세션을 기록합니다.

### 3단계: 데이터 확인
1. **대시보드** 탭에서 학습 패턴을 시각적으로 확인합니다.
2. 시간대별 집중도, 과목별 학습 시간 등을 분석합니다.

### 4단계: AI 피드백 받기
1. **AI 피드백** 탭으로 이동합니다.
2. **AI 분석 시작** 버튼을 클릭합니다.
3. 나만의 맞춤형 학습 추천을 확인합니다.

---

## ⚙️ 환경 변수

```env
# .env
VITE_OPENAI_API_KEY=your_api_key_here
```

> ⚠️ **주의**: API 키는 절대 GitHub에 커밋하지 마세요. `.env` 파일은 `.gitignore`에 포함되어야 합니다.

---

## 🗃️ 가상 데이터 (Mock Data)

첫 실행 시 일주일치 가상 학습 데이터가 자동으로 주입됩니다. 이를 통해 AI 피드백과 대시보드의 모든 기능을 즉시 체험할 수 있습니다.

가상 데이터 초기화: 대시보드 하단 **"데이터 초기화"** 버튼 클릭

---

## 📄 라이선스

MIT License - 공모전 출품용 프로젝트
=======