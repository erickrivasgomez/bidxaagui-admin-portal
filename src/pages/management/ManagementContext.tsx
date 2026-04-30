import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InspectorState {
  isOpen: boolean;
  isCreating: boolean;
  selectedId: string | null;
}

interface ManagementContextValue {
  inspector: InspectorState;
  openInspector: (isCreating?: boolean, selectedId?: string) => void;
  closeInspector: () => void;
}

const ManagementContext = createContext<ManagementContextValue | undefined>(undefined);

export const useManagement = () => {
  const context = useContext(ManagementContext);
  if (!context) {
    throw new Error('useManagement must be used within ManagementProvider');
  }
  return context;
};

interface ManagementProviderProps {
  children: ReactNode;
}

export const ManagementProvider: React.FC<ManagementProviderProps> = ({ children }) => {
  const [inspector, setInspector] = useState<InspectorState>({
    isOpen: false,
    isCreating: true,
    selectedId: null,
  });

  const openInspector = (isCreating = true, selectedId: string | null = null) => {
    setInspector({
      isOpen: true,
      isCreating,
      selectedId,
    });
  };

  const closeInspector = () => {
    setInspector({
      isOpen: false,
      isCreating: true,
      selectedId: null,
    });
  };

  return (
    <ManagementContext.Provider value={{ inspector, openInspector, closeInspector }}>
      {children}
    </ManagementContext.Provider>
  );
};
