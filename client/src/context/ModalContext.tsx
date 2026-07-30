import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isNewJobOpen: boolean;
  setIsNewJobOpen: (open: boolean) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  stockItemToAdjust: any | null;
  setStockItemToAdjust: (item: any | null) => void;
  isStockModalOpen: boolean;
  setIsStockModalOpen: (open: boolean) => void;
  openNewJob: () => void;
  openJobDetail: (id: string) => void;
  openEstimator?: () => void;
  openStockModal: (item?: any) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [stockItemToAdjust, setStockItemToAdjust] = useState<any | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const openNewJob = () => setIsNewJobOpen(true);
  const openJobDetail = (id: string) => setSelectedJobId(id);
  const openEstimator = () => {};
  const openStockModal = (item?: any) => {
    setStockItemToAdjust(item || null);
    setIsStockModalOpen(true);
  };

  return (
    <ModalContext.Provider
      value={{
        isNewJobOpen,
        setIsNewJobOpen,
        selectedJobId,
        setSelectedJobId,
        stockItemToAdjust,
        setStockItemToAdjust,
        isStockModalOpen,
        setIsStockModalOpen,
        openNewJob,
        openJobDetail,
        openEstimator,
        openStockModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModals must be used within ModalProvider');
  return ctx;
}
