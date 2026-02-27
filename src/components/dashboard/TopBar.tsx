import { useState, useEffect } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/lib/admin-store';
import PinDialog from './PinDialog';
import AdminPanel from './AdminPanel';

interface TopBarProps {
  activeTab: 'collections' | 'scorecard';
}

const TopBar = ({ activeTab }: TopBarProps) => {
  const [time, setTime] = useState('');
  const { isUnlocked } = useAdmin();
  const [pinOpen, setPinOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleGearClick = () => {
    if (isUnlocked) {
      setPanelOpen(true);
    } else {
      setPinOpen(true);
    }
  };

  return (
    <>
      <nav className="bg-primary sticky top-0 z-50 flex h-[62px] items-center justify-between px-7 shadow-card-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-[36px] w-[36px] place-items-center rounded-md bg-accent">
            <BarChart3 size={20} className="text-primary" />
          </div>
          <span className="font-display text-[26px] tracking-[3px] text-primary-foreground">
            Credit Dept
          </span>
          <div className="mx-1 hidden h-6 w-px bg-primary-foreground/15 sm:block" />
          <span className="hidden text-[12px] font-semibold tracking-[3px] uppercase text-primary-foreground/35 sm:block">
            Performance Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald/45 bg-emerald/25 px-3.5 py-1.5 text-[12px] font-bold tracking-[2px] uppercase text-emerald">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald" />
            Live
          </div>
          <span className="hidden text-[13px] tracking-wider text-primary-foreground/35 sm:block">{time}</span>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleGearClick}
            className="relative ml-1 h-9 w-9 text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Settings size={20} />
            {isUnlocked && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-accent border-2 border-primary" />
            )}
          </Button>
        </div>
      </nav>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onSuccess={() => setPanelOpen(true)} />
      <AdminPanel open={panelOpen} onOpenChange={setPanelOpen} tab={activeTab} />
    </>
  );
};

export default TopBar;
