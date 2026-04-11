import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Timer from './components/Timer/Timer';
import Dashboard from './components/Dashboard/Dashboard';
import AIFeedback from './components/AIFeedback/AIFeedback';
import type { StudySession } from './types';
import { loadSessions, saveSessions, clearSessions, isMockLoaded, setMockLoaded } from './utils/storage';
import { generateMockSessions } from './data/mockData';

function TimerPage({ sessions, onSessionSaved }: { sessions: StudySession[]; onSessionSaved: (s: StudySession) => void }) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">학습 타이머</h2>
        <p className="text-slate-400 text-sm mt-1">과목과 학습 유형을 선택하고 공부를 시작하세요</p>
      </div>
      <Timer onSessionSaved={onSessionSaved} />
      {sessions.length > 0 && (
        <div className="mt-8 text-center text-sm text-slate-500">
          총 <span className="text-purple-400 font-semibold">{sessions.length}</span>개의 세션이 기록되었어요
        </div>
      )}
    </div>
  );
}

function DashboardPage({ sessions, onClearData }: { sessions: StudySession[]; onClearData: () => void }) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">학습 대시보드</h2>
        <p className="text-slate-400 text-sm mt-1">나의 학습 패턴을 한눈에 확인하세요</p>
      </div>
      <Dashboard sessions={sessions} onClearData={onClearData} />
    </div>
  );
}

function FeedbackPage({ sessions }: { sessions: StudySession[] }) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">AI 피드백</h2>
        <p className="text-slate-400 text-sm mt-1">AI가 나만의 맞춤형 학습 방법을 추천해 드려요</p>
      </div>
      <AIFeedback sessions={sessions} />
    </div>
  );
}

export default function App() {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    let loaded = loadSessions();
    if (!isMockLoaded()) {
      const mock = generateMockSessions();
      loaded = [...mock, ...loaded];
      saveSessions(loaded);
      setMockLoaded();
    }
    setSessions(loaded);
  }, []);

  const handleSessionSaved = (session: StudySession) => {
    setSessions(prev => {
      const updated = [...prev, session];
      saveSessions(updated);
      return updated;
    });
  };

  const handleClearData = () => {
    clearSessions();
    const mock = generateMockSessions();
    saveSessions(mock);
    setMockLoaded();
    setSessions(mock);
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TimerPage sessions={sessions} onSessionSaved={handleSessionSaved} />} />
          <Route path="/dashboard" element={<DashboardPage sessions={sessions} onClearData={handleClearData} />} />
          <Route path="/feedback" element={<FeedbackPage sessions={sessions} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
