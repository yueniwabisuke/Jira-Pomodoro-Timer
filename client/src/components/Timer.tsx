import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { isAxiosError } from 'axios';
import { Issue } from '../types';
import './Timer.css';

interface Props {
  activeIssue: Issue | null;
  onTimerStop: () => void;
}

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

const Timer: React.FC<Props> = ({ activeIssue, onTimerStop }) => {
  const [time, setTime] = useState(POMODORO_DURATION);
  const [secondHandAngle, setSecondHandAngle] = useState(0);
  const [minuteHandAngle, setMinuteHandAngle] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeIssue) {
      setSecondHandAngle(0);
      setMinuteHandAngle(0);
      setTime(POMODORO_DURATION);
      startTimer();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeIssue]);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setTime(prevTime => {
        const newTime = prevTime - 1;
        if (newTime < 0) {
          logWork(POMODORO_DURATION);
          return 0;
        }

        const totalSecondsSpent = POMODORO_DURATION - newTime;
        const secondsAngle = (totalSecondsSpent % 60) * 6;
        setSecondHandAngle(secondsAngle);
        const minuteAngle = (totalSecondsSpent / POMODORO_DURATION) * 360;
        setMinuteHandAngle(minuteAngle);
        
        return newTime;
      });
    }, 1000);
  };

  const stopTimerAndLog = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const timeSpentSeconds = POMODORO_DURATION - time;
    logWork(timeSpentSeconds);
  };
  
  const logWork = async (timeSpentSeconds: number) => {
    if (!activeIssue) {
      onTimerStop();
      return;
    }
    document.title = 'Jira Pomodoro Timer'; // Reset title

    // Jira requires time spent to be at least 1 minute (60 seconds)
    if (timeSpentSeconds < 60) {
      alert(`作業時間が1分未満のため、Jiraには記録されませんでした。`);
      onTimerStop();
      return;
    }

    try {
      await api.post(`/issues/${activeIssue.key}/worklog`, { timeSpentSeconds });
      alert(`Worklog of ${Math.round(timeSpentSeconds / 60)} minutes added to ${activeIssue.key}.`);
    } catch (error) {
      console.error('Failed to log work:', error);
      let alertMessage = 'Failed to log work.';
      if (isAxiosError(error)) alertMessage += `\nError: ${error.response?.data?.message || 'Server error'}`;
      alert(alertMessage);
    } finally {
      onTimerStop();
    }
  };

  if (!activeIssue) return null;

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${activeIssue.summary}`;

  return (
    <div className="timer-focus-container">
      <svg viewBox="0 0 100 100" className="analog-clock">
        <circle cx="50" cy="50" r="48" className="clock-face" />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          className="minute-hand"
          style={{ transform: `rotate(${minuteHandAngle}deg)` }}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          className="second-hand"
          style={{ transform: `rotate(${secondHandAngle}deg)` }}
        />
      </svg>

      <p className="task-display">🍅 {activeIssue.key}: {activeIssue.summary}</p>
      <h1 className="timer-display">
        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </h1>
      <button onClick={stopTimerAndLog} className="stop-button">
        Stop Timer & Log Work
      </button>
    </div>
  );
};

export default Timer;
