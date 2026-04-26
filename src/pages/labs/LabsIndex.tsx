import { useState } from 'react';
import { LabsLayout } from './LabsLayout';
import { LabsDashboard } from './LabsDashboard';
import { LabsInventory } from './LabsInventory';
import { LabsSales } from './LabsSales';
import { LabsFinance } from './LabsFinance';
import { LabsSuppliers } from './LabsSuppliers';
import { LabsReports } from './LabsReports';

export const LabsIndex = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <LabsDashboard view={currentView} />;
      case 'inventory': return <LabsInventory view={currentView} />;
      case 'sales': return <LabsSales view={currentView} />;
      case 'finance': return <LabsFinance view={currentView} />;
      case 'suppliers': return <LabsSuppliers view={currentView} />;
      case 'reports': return <LabsReports view={currentView} />;
      default: return <LabsDashboard view={currentView} />;
    }
  };

  return (
    <LabsLayout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </LabsLayout>
  );
};
