import { useRef, useState } from 'react';
import { Upload, Download, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/lib/dashboard-store';
import {
  downloadCsv,
  generateCollectionsTemplate,
  generateScorecardTemplate,
  parseCollectionsCsv,
  parseScorecardCsv,
} from '@/lib/csv-utils';
import { toast } from 'sonner';
import EditTargetsDialog from './EditTargetsDialog';

interface DataToolbarProps {
  tab: 'collections' | 'scorecard';
}

const DataToolbar = ({ tab }: DataToolbarProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const store = useDashboard();

  const handleDownloadTemplate = () => {
    if (tab === 'collections') {
      downloadCsv(generateCollectionsTemplate(), 'collections_template.csv');
    } else {
      downloadCsv(generateScorecardTemplate(), 'scorecard_template.csv');
    }
    toast.success('Template downloaded');
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        if (tab === 'collections') {
          const agents = parseCollectionsCsv(text);
          if (agents.length === 0) throw new Error('No data rows found');
          store.setAgents(agents);
          toast.success(`Imported ${agents.length} agents`);
        } else {
          const { metrics, weekly, monthly } = parseScorecardCsv(text);
          if (metrics.length > 0) store.setMetrics(metrics);
          if (weekly.length > 0) store.setWeekly(weekly);
          if (monthly.length > 0) store.setMonthly(monthly);
          const count = metrics.length + weekly.length + monthly.length;
          toast.success(`Imported ${count} records`);
        }
      } catch (err: any) {
        toast.error(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="default" onClick={handleImport} className="gap-2 text-[13px] tracking-wider uppercase">
          <Upload size={16} /> Import CSV
        </Button>
        <Button variant="outline" size="default" onClick={handleDownloadTemplate} className="gap-2 text-[13px] tracking-wider uppercase">
          <Download size={16} /> Download Template
        </Button>
        <Button variant="outline" size="default" onClick={() => setEditOpen(true)} className="gap-2 text-[13px] tracking-wider uppercase">
          <Pencil size={16} /> Edit Targets
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <EditTargetsDialog open={editOpen} onOpenChange={setEditOpen} tab={tab} />
    </>
  );
};

export default DataToolbar;
