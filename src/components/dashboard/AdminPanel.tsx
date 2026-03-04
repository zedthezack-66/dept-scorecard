import { useRef, useState } from 'react';
import { Upload, Download, Pencil, Lock, KeyRound } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDashboard } from '@/lib/dashboard-store';
import { useAdmin } from '@/lib/admin-store';
import {
  downloadCsv,
  generateCollectionsTemplate,
  generateScorecardTemplate,
  parseCollectionsCsv,
  parseScorecardCsv,
} from '@/lib/csv-utils';
import { toast } from 'sonner';
import EditTargetsDialog from './EditTargetsDialog';

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: 'collections' | 'scorecard';
}

const AdminPanel = ({ open, onOpenChange, tab }: AdminPanelProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const store = useDashboard();
  const { lock, changePin } = useAdmin();
  const [editOpen, setEditOpen] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleDownloadTemplate = () => {
    if (tab === 'collections') {
      downloadCsv(generateCollectionsTemplate(store.agents), 'collections_export.csv');
    } else {
      downloadCsv(generateScorecardTemplate(store.metrics, store.weekly, store.monthly), 'scorecard_export.csv');
    }
    toast.success('Template downloaded');
  };

  const handleImport = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        if (tab === 'collections') {
          const agents = parseCollectionsCsv(text);
          if (agents.length === 0) throw new Error('No data rows found');
          await store.setAgents(agents);
          toast.success(`Imported ${agents.length} agents — synced to all users`);
        } else {
          const { metrics, weekly, monthly } = parseScorecardCsv(text);
          if (metrics.length > 0) await store.setMetrics(metrics);
          if (weekly.length > 0) await store.setWeekly(weekly);
          if (monthly.length > 0) await store.setMonthly(monthly);
          const count = metrics.length + weekly.length + monthly.length;
          toast.success(`Imported ${count} records — synced to all users`);
        }
      } catch (err: any) {
        toast.error(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChangePin = () => {
    if (newPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    if (changePin(oldPin, newPin)) {
      toast.success('PIN updated');
      setOldPin('');
      setNewPin('');
      setChangePinOpen(false);
    } else {
      toast.error('Current PIN is incorrect');
    }
  };

  const handleLock = () => {
    lock();
    onOpenChange(false);
    toast.info('Admin session locked');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col gap-0 w-[340px] sm:max-w-[340px]">
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display text-[24px] tracking-[3px]">Admin Tools</SheetTitle>
            <SheetDescription className="text-[13px]">
              Manage data for the <span className="font-semibold capitalize">{tab}</span> tab
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-2">
            <Button variant="outline" className="justify-start gap-3 h-12 text-[14px] tracking-wider uppercase" onClick={handleImport}>
              <Upload size={18} /> Import CSV
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12 text-[14px] tracking-wider uppercase" onClick={handleDownloadTemplate}>
              <Download size={18} /> Download Template
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12 text-[14px] tracking-wider uppercase" onClick={() => setEditOpen(true)}>
              <Pencil size={18} /> Edit Targets
            </Button>

            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />

            <Separator className="my-3" />

            {!changePinOpen ? (
              <Button variant="ghost" className="justify-start gap-3 h-10 text-[13px] tracking-wider uppercase text-muted-foreground" onClick={() => setChangePinOpen(true)}>
                <KeyRound size={16} /> Change PIN
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Label className="text-[12px] tracking-wider uppercase text-muted-foreground">Current PIN</Label>
                <Input type="password" maxLength={4} value={oldPin} onChange={(e) => setOldPin(e.target.value)} placeholder="••••" />
                <Label className="text-[12px] tracking-wider uppercase text-muted-foreground">New PIN</Label>
                <Input type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="••••" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleChangePin} className="flex-1">Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setChangePinOpen(false); setOldPin(''); setNewPin(''); }}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="mt-auto pt-4">
              <Button variant="destructive" className="w-full justify-center gap-3 h-12 text-[14px] tracking-wider uppercase" onClick={handleLock}>
                <Lock size={18} /> Lock Session
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <EditTargetsDialog open={editOpen} onOpenChange={setEditOpen} tab={tab} />
    </>
  );
};

export default AdminPanel;
