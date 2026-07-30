import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { ModalProvider, useModals } from '../context/ModalContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

// Modals
import { NewJobModal } from '../components/NewJobModal';
import { JobDetailModal } from '../components/JobDetailModal';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';

function RootLayoutContent() {
  const {
    isNewJobOpen,
    setIsNewJobOpen,
    selectedJobId,
    setSelectedJobId,
    isStockModalOpen,
    setIsStockModalOpen,
    stockItemToAdjust,
    setStockItemToAdjust,
    openNewJob,
  } = useModals();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <Navbar
        onOpenNewJob={openNewJob}
        onOpenEstimator={() => {}}
      />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-[1700px] mx-auto w-full">
        <Outlet />
      </main>

      {/* Global Modals */}
      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
      />

      <JobDetailModal
        jobId={selectedJobId}
        isOpen={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />

      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockItemToAdjust(null);
        }}
      />
    </div>
  );
}

export const Route = createRootRoute({
  component: function RootLayout() {
    return (
      <ThemeProvider>
        <AuthProvider>
          <ModalProvider>
            <RootLayoutContent />
          </ModalProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  },
});
