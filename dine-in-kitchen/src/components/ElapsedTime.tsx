import { useEffect, useState } from 'react';

interface ElapsedTimeProps {
  createdAt: string;
}

export function ElapsedTime({ createdAt }: ElapsedTimeProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const diff = Date.now() - new Date(createdAt).getTime();
      setElapsed(Math.max(0, Math.floor(diff / 1000)));
    };

    calculate();
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const colorClass = minutes >= 15
    ? 'text-red-400 animate-pulse'
    : minutes >= 10
      ? 'text-yellow-400'
      : 'text-green-400';

  return (
    <span className={`font-mono text-sm font-bold ${colorClass}`}>
      {minutes}m {seconds.toString().padStart(2, '0')}s
    </span>
  );
}
