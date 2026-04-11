import type { StudySession } from '../types';

const SESSIONS_KEY = 'focusmate_sessions';
const MOCK_LOADED_KEY = 'focusmate_mock_loaded';

export function loadSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as StudySession[]) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: StudySession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function addSession(session: StudySession): StudySession[] {
  const sessions = loadSessions();
  const updated = [...sessions, session];
  saveSessions(updated);
  return updated;
}

export function clearSessions(): void {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(MOCK_LOADED_KEY);
}

export function isMockLoaded(): boolean {
  return localStorage.getItem(MOCK_LOADED_KEY) === 'true';
}

export function setMockLoaded(): void {
  localStorage.setItem(MOCK_LOADED_KEY, 'true');
}
