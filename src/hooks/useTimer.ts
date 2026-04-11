import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerStatus, Subject, StudyType } from '../types';

interface UseTimerReturn {
  status: TimerStatus;
  elapsed: number;
  subject: Subject;
  studyType: StudyType;
  startTime: string;
  setSubject: (s: Subject) => void;
  setStudyType: (t: StudyType) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export function useTimer(): UseTimerReturn {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState<Subject>('수학');
  const [studyType, setStudyType] = useState<StudyType>('개념학습');
  const [startTime, setStartTime] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const start = useCallback(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setStartTime(`${h}:${m}`);
    setElapsed(0);
    setStatus('running');
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    setStatus('running');
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setStatus('stopped');
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setElapsed(0);
    setStartTime('');
    setStatus('idle');
  }, [clearTimer]);

  return {
    status,
    elapsed,
    subject,
    studyType,
    startTime,
    setSubject,
    setStudyType,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
