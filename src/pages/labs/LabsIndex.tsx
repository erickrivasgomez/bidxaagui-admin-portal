import { useState } from 'react';
import { LabsLayout } from './LabsLayout';
import { LabsDashboard } from './LabsDashboard';
import { LabsInventory } from './LabsInventory';
import { LabsSales } from './LabsSales';
import { LabsFinance } from './LabsFinance';
import { LabsSuppliers } from './LabsSuppliers';
import { LabsReports } from './LabsReports';

const DENSITY_STORAGE_KEY = 'labs-density-preference';

const getInitialDensity = () => {
  const savedDensity = localStorage.getItem(DENSITY_STORAGE_KEY);
  if (savedDensity && ['default', 'compact', 'ultra-compact'].includes(savedDensity)) {
    return savedDensity;
  }
  return 'default';
};

export const LabsIndex = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [density, setDensity] = useState(getInitialDensity);

  const handleDensityChange = (newDensity: string) => {
    setDensity(newDensity);
    localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <LabsDashboard view={currentView} />;
      case 'inventory': return <LabsInventory view={currentView} />;
      case 'sales': return <LabsSales view={currentView} />;
      case 'finance': return <LabsFinance view={currentView} />;
      case 'suppliers': return <LabsSuppliers />;
      case 'reports': return <LabsReports view={currentView} />;
      default: return <LabsDashboard view={currentView} />;
    }
  };

  return (
    <LabsLayout currentView={currentView} setView={setCurrentView} density={density} setDensity={handleDensityChange}>
      {renderView()}
    </LabsLayout>
  );
};
