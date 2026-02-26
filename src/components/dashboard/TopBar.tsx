import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

const TopBar = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="bg-primary sticky top-0 z-50 flex h-[54px] items-center justify-between px-7 shadow-card-lg">
      <div className="flex items-center gap-3">
        <div className="grid h-[30px] w-[30px] place-items-center rounded-md bg-accent">
          <BarChart3 size={16} className="text-primary" />
        </div>
        <span className="font-display text-[22px] tracking-[3px] text-primary-foreground">
          Credit Dept
        </span>
        <div className="mx-1 hidden h-6 w-px bg-primary-foreground/15 sm:block" />
        <span className="hidden text-[10px] font-semibold tracking-[3px] uppercase text-primary-foreground/35 sm:block">
          Performance Dashboard
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 rounded-full border border-emerald/45 bg-emerald/25 px-3 py-1 text-[10px] font-bold tracking-[2px] uppercase text-emerald">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
          Live
        </div>
        <span className="hidden text-[11px] tracking-wider text-primary-foreground/35 sm:block">{time}</span>
      </div>
    </nav>
  );
};

export default TopBar;
