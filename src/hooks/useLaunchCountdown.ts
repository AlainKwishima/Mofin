import { useEffect, useState } from 'react';
import { LAUNCH_DATE } from '../constants/launch';

function getRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function useLaunchCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = LAUNCH_DATE.getTime();
  const isLive = now >= target;
  const remaining = Math.max(0, target - now);

  return {
    isLive,
    ...getRemaining(remaining),
  };
}
