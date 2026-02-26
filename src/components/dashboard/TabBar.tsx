import { Users, LayoutGrid } from 'lucide-react';

interface TabBarProps {
  activeTab: 'collections' | 'scorecard';
  onTabChange: (tab: 'collections' | 'scorecard') => void;
}

const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  const tabs = [
    { id: 'collections' as const, label: 'Collections Team', icon: Users },
    { id: 'scorecard' as const, label: 'Department Scorecard', icon: LayoutGrid },
  ];

  return (
    <div className="flex gap-1 border-b border-primary-foreground/10 bg-navy-2 px-7">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 border-b-[3px] px-5 py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-all ${
            activeTab === tab.id
              ? 'border-accent text-primary-foreground'
              : 'border-transparent text-primary-foreground/40 hover:text-primary-foreground/75'
          }`}
        >
          <tab.icon size={12} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
