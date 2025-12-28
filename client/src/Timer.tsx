import React, { useState, useEffect, useRef } from 'react';
import { Issue } from './types'; // Corrected import path
import axios, { isAxiosError } from 'axios';

interface Props {
  activeIssue: Issue | null;
  onTimerStop: () => void;
}

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

const Timer: React.FC<Props> = ({ activeIssue, onTimerStop }) => {
  const [time, setTime] = useState(POMODORO_DURATION);
  const intervalRef = useRef<number | null>(null);

  // This effect starts and stops the timer based on `activeIssue`
  useEffect(() => {
    if (activeIssue) {
      setTime(POMODORO_DURATION);
      startTimer();
    }

    // Cleanup function to clear the interval when the component unmounts or `activeIssue` changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeIssue]);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          // Timer finished, log the work automatically
          logWork(POMODORO_DURATION);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimerAndLog = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const timeSpentSeconds = POMODORO_DURATION - time;
    logWork(timeSpentSeconds);
  };
  
  const logWork = async (timeSpentSeconds: number) => {
    if (!activeIssue || timeSpentSeconds <= 0) {
      onTimerStop(); // Ensure we always call onTimerStop to return to the list
      return;
    }

    try {
      await axios.post(`/api/issues/${activeIssue.key}/worklog`, {
        timeSpentSeconds,
      });
      alert(`Worklog of ${Math.round(timeSpentSeconds / 60)} minutes added to ${activeIssue.key}.`);
    } catch (error) {
      console.error('Failed to log work:', error);
      let alertMessage = 'Failed to log work. See console for details.';
      if (isAxiosError(error)) {
        alertMessage += `\nError: ${error.response?.data?.message || 'Server error'}`;
      }
      alert(alertMessage);
    } finally {
      onTimerStop(); // Always return to the issue list screen
    }
  };


  if (!activeIssue) {
    return null;
  }

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="card">
      <h3>🍅 Now Working On:</h3>
      <p>{activeIssue.key}: {activeIssue.summary}</p>
      <h1>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</h1>
      <button onClick={stopTimerAndLog}>Stop Timer & Log Work</button>
    </div>
  );
};

export default Timer;
