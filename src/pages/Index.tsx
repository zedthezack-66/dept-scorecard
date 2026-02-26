import { useState } from 'react';
import TopBar from '@/components/dashboard/TopBar';
import TabBar from '@/components/dashboard/TabBar';
import CollectionsTab from '@/components/dashboard/CollectionsTab';
import ScorecardTab from '@/components/dashboard/ScorecardTab';
import { DashboardProvider } from '@/lib/dashboard-store';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'collections' | 'scorecard'>('collections');

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        <TopBar />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'collections' ? <CollectionsTab /> : <ScorecardTab />}
      </div>
    </DashboardProvider>
  );
};

export default Index;
