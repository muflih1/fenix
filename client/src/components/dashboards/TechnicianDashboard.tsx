import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Wrench, 
  CheckCircle2, 
  Package, 
  Layers, 
  Zap, 
  Cpu, 
  Box, 
  ArrowRight,
  Sparkles,
  Download,
  Plus,
  Trash2
} from 'lucide-react';

export interface LEDEntry {
  id: string;
  color: string;
  count: number;
}

export interface AdapterEntry {
  id: string;
  wattage: string;
  count: number;
}

export function TechnicianDashboard() {
  const utils = trpc.useUtils();

  const { data: productionJobs = [], isLoading: isJobsLoading } = trpc.jobs.list.useQuery({ stage: 'PRODUCTION' });
  const { data: inventoryItems = [] } = trpc.inventory.list.useQuery({});

  // Dynamic Multi-Item LED and Power Adapter State per job
  const [ledEntriesMap, setLedEntriesMap] = useState<{ [key: string]: LEDEntry[] }>({});
  const [adapterEntriesMap, setAdapterEntriesMap] = useState<{ [key: string]: AdapterEntry[] }>({});
  const [completedBuilds, setCompletedBuilds] = useState<{ 
    [key: string]: { 
      ledQty: number; 
      ledSummary: string; 
      adapterQty: number; 
      adapterSummary: string 
    } 
  }>({});

  const updateStageMutation = trpc.jobs.updateStage.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
    }
  });

  const updateStockMutation = trpc.inventory.updateStock.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
    }
  });

  if (isJobsLoading) {
    return <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Loading Technician Terminal...</div>;
  }

  // Inventory items for stock deduction
  const ledModuleItem = inventoryItems.find((i: any) => i.category === 'LED_MODULES' || i.sku.includes('LED')) || {
    id: 'INV-101',
    name: 'Samsung 2835 3-LED Module (White 6500K)',
    stockQuantity: 450,
    unit: 'pcs'
  };

  const powerSupplyItem = inventoryItems.find((i: any) => i.category === 'POWER_SUPPLIES' || i.sku.includes('PSU')) || {
    id: 'INV-102',
    name: 'MeanWell 400W 12V IP67 Power Adapter',
    stockQuantity: 35,
    unit: 'pcs'
  };

  // Helper functions for dynamic multi-item entries
  const getLedEntries = (jobId: string): LEDEntry[] => {
    return ledEntriesMap[jobId] || [
      { id: 'led-1', color: '6500K Cool White', count: 240 }
    ];
  };

  const getAdapterEntries = (jobId: string): AdapterEntry[] => {
    return adapterEntriesMap[jobId] || [
      { id: 'ad-1', wattage: '400W 12V IP67 Waterproof', count: 2 }
    ];
  };

  const handleAddLedEntry = (jobId: string) => {
    const current = getLedEntries(jobId);
    const newEntry: LEDEntry = {
      id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      color: '3000K Warm White',
      count: 60
    };
    setLedEntriesMap(prev => ({ ...prev, [jobId]: [...current, newEntry] }));
  };

  const handleRemoveLedEntry = (jobId: string, entryId: string) => {
    const current = getLedEntries(jobId);
    if (current.length <= 1) return;
    setLedEntriesMap(prev => ({ ...prev, [jobId]: current.filter(e => e.id !== entryId) }));
  };

  const handleUpdateLedEntry = (jobId: string, entryId: string, key: 'color' | 'count', value: any) => {
    const current = getLedEntries(jobId);
    setLedEntriesMap(prev => ({
      ...prev,
      [jobId]: current.map(e => e.id === entryId ? { ...e, [key]: value } : e)
    }));
  };

  const handleAddAdapterEntry = (jobId: string) => {
    const current = getAdapterEntries(jobId);
    const newEntry: AdapterEntry = {
      id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      wattage: '150W 12V IP67 Waterproof',
      count: 1
    };
    setAdapterEntriesMap(prev => ({ ...prev, [jobId]: [...current, newEntry] }));
  };

  const handleRemoveAdapterEntry = (jobId: string, entryId: string) => {
    const current = getAdapterEntries(jobId);
    if (current.length <= 1) return;
    setAdapterEntriesMap(prev => ({ ...prev, [jobId]: current.filter(e => e.id !== entryId) }));
  };

  const handleUpdateAdapterEntry = (jobId: string, entryId: string, key: 'wattage' | 'count', value: any) => {
    const current = getAdapterEntries(jobId);
    setAdapterEntriesMap(prev => ({
      ...prev,
      [jobId]: current.map(e => e.id === entryId ? { ...e, [key]: value } : e)
    }));
  };

  const handleConfirmBuildAndDeductStock = (job: any) => {
    const leds = getLedEntries(job.id);
    const adapters = getAdapterEntries(job.id);

    const totalLedsCount = leds.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const totalAdaptersCount = adapters.reduce((sum, item) => sum + Number(item.count || 0), 0);

    const ledSpecsSummary = leds.map(item => `${item.count}pcs ${item.color}`).join(', ');
    const adapterSpecsSummary = adapters.map(item => `${item.count}pcs ${item.wattage}`).join(', ');

    const newLedStock = Math.max(0, Number(ledModuleItem.stockQuantity) - totalLedsCount);
    const newAdapterStock = Math.max(0, Number(powerSupplyItem.stockQuantity) - totalAdaptersCount);

    // 1. Deduct total LED modules from Inventory with detailed multi-color summary
    updateStockMutation.mutate({
      id: ledModuleItem.id,
      stockQuantity: newLedStock,
      notes: `Deducted ${totalLedsCount} pcs LEDs (${ledSpecsSummary}) for Job ${job.id}`
    });

    // 2. Deduct total Power Supply Adapters from Inventory with detailed wattage summary
    updateStockMutation.mutate({
      id: powerSupplyItem.id,
      stockQuantity: newAdapterStock,
      notes: `Deducted ${totalAdaptersCount} pcs Adapters (${adapterSpecsSummary}) for Job ${job.id}`
    });

    // 3. Mark Build Completed & Advance to INSTALLATION stage
    updateStageMutation.mutate({
      id: job.id,
      stage: 'INSTALLATION'
    });

    // Save local build completion notice
    setCompletedBuilds(prev => ({
      ...prev,
      [job.id]: {
        ledQty: totalLedsCount,
        ledSummary: ledSpecsSummary,
        adapterQty: totalAdaptersCount,
        adapterSummary: adapterSpecsSummary
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <h1 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Wrench className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Technician Assembly Terminal
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Active Technician: <span className="font-bold text-amber-600 dark:text-yellow-400">Marco Vance (Shop Floor Technician)</span> — Inspect approved signage designs, add multiple LED colors and adapter wattages, and automatically deduct warehouse inventory stock.
        </p>
      </div>

      {/* Warehouse Live Inventory Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 dark:text-yellow-400 uppercase flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> LED Modules Stock
            </span>
            <div className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
              {ledModuleItem.stockQuantity} <span className="text-xs font-semibold text-slate-500">{ledModuleItem.unit} available</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{ledModuleItem.name}</p>
          </div>
          <Cpu className="h-8 w-8 text-amber-600 dark:text-yellow-400 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 dark:text-yellow-400 uppercase flex items-center gap-1.5">
              <Box className="h-4 w-4" /> Power Supply Adapters Stock
            </span>
            <div className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
              {powerSupplyItem.stockQuantity} <span className="text-xs font-semibold text-slate-500">{powerSupplyItem.unit} available</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{powerSupplyItem.name}</p>
          </div>
          <Package className="h-8 w-8 text-amber-600 dark:text-yellow-400 opacity-60" />
        </div>
      </div>

      {/* COMPLETED APPROVED DESIGNS ASSEMBLY QUEUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Completed Design Mockups Ready for Assembly ({productionJobs.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Approved by Production Supervisor</span>
        </div>

        {productionJobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#141417] space-y-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
            <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">All shop floor assembly tasks completed!</div>
            <p className="text-slate-500 dark:text-zinc-400">No active design mockups waiting for LED wiring or stock deduction.</p>
          </div>
        ) : (
          productionJobs.map((job: any) => {
            const ledEntries = getLedEntries(job.id);
            const adapterEntries = getAdapterEntries(job.id);
            const isCompleted = completedBuilds[job.id];

            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-4 shadow-xs"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600 dark:text-yellow-400 font-mono text-xs">{job.id}</span>
                      <Badge variant="production">Design Approved</Badge>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{job.companyName || job.customerName}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Sign Type: <strong className="text-slate-800 dark:text-zinc-200">{job.signType.replace(/_/g, ' ')}</strong> • Dimensions: <strong className="text-amber-600 dark:text-yellow-400">{job.dimensions.width} x {job.dimensions.height} {job.dimensions.unit}</strong>
                    </p>
                  </div>
                </div>

                {/* 1. VISUAL APPROVED DESIGN MOCKUP PREVIEW */}
                <div className="space-y-2 p-3.5 rounded-xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-yellow-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Approved Signage Design Mockup Proof
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Approved_Artwork_{job.id}_v2.png
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-950 group">
                    <img 
                      src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80" 
                      alt="Approved Design Mockup Proof" 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-3 justify-between">
                      <div className="text-white text-xs">
                        <span className="font-extrabold text-amber-400 block">3D Illuminated Front-Lit Acrylic LED Signage</span>
                        <span className="text-[11px] text-slate-300">Front-Lit Acrylic Channel Letters • 6500K Cool White Illumination</span>
                      </div>
                      <a 
                        href="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-yellow-400 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Download className="h-3 w-3" /> View High-Res Artwork
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMIC MULTI-ITEM LED & ADAPTER CONSUMPTION INPUTS */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-4">
                  <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider block flex items-center gap-1.5">
                    <Box className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> Enter Multiple LEDs & Adapters Used to Deduct Stock
                  </span>

                  {/* MULTIPLE LED MODULES SECTION */}
                  <div className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> 1. LED Modules Used ({ledEntries.length} Types)
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddLedEntry(job.id)}
                        icon={<Plus className="h-3 w-3 text-amber-600 dark:text-yellow-400" />}
                      >
                        + Add Another LED Color
                      </Button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {ledEntries.map((entry, idx) => (
                        <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <div className="sm:col-span-6">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                              LED #{idx + 1} Illumination Color *
                            </label>
                            <select
                              value={entry.color}
                              onChange={(e) => handleUpdateLedEntry(job.id, entry.id, 'color', e.target.value)}
                              className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                            >
                              <option value="6500K Cool White">6500K Cool White (Pure White)</option>
                              <option value="3000K Warm White">3000K Warm White (Golden Glow)</option>
                              <option value="RGB Dual-Channel">RGB Multi-Color Changing</option>
                              <option value="Red (620nm)">Red (620nm)</option>
                              <option value="Blue (460nm)">Blue (460nm)</option>
                              <option value="Green (525nm)">Green (525nm)</option>
                              <option value="Amber (590nm)">Amber (590nm)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                              Modules Count *
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                value={entry.count}
                                onChange={(e) => handleUpdateLedEntry(job.id, entry.id, 'count', Number(e.target.value))}
                                className="w-full text-xs font-bold p-2 pr-10 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                              />
                              <span className="absolute right-2.5 top-2 text-xs font-semibold text-slate-400">pcs</span>
                            </div>
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            {ledEntries.length > 1 && (
                              <button
                                onClick={() => handleRemoveLedEntry(job.id, entry.id)}
                                className="p-2 rounded-md bg-rose-600/90 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                title="Remove LED row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MULTIPLE POWER SUPPLY ADAPTERS SECTION */}
                  <div className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Box className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> 2. Power Adapters Used ({adapterEntries.length} Types)
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddAdapterEntry(job.id)}
                        icon={<Plus className="h-3 w-3 text-amber-600 dark:text-yellow-400" />}
                      >
                        + Add Another Power Adapter
                      </Button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {adapterEntries.map((entry, idx) => (
                        <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <div className="sm:col-span-6">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                              Adapter #{idx + 1} Power Wattage *
                            </label>
                            <select
                              value={entry.wattage}
                              onChange={(e) => handleUpdateAdapterEntry(job.id, entry.id, 'wattage', e.target.value)}
                              className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                            >
                              <option value="400W 12V IP67 Waterproof">400W 12V IP67 Waterproof</option>
                              <option value="200W 12V IP67 Waterproof">200W 12V IP67 Waterproof</option>
                              <option value="150W 12V IP67 Waterproof">150W 12V IP67 Waterproof</option>
                              <option value="100W 12V Slim Indoor">100W 12V Slim Indoor</option>
                              <option value="60W 12V Compact">60W 12V Compact</option>
                            </select>
                          </div>

                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                              Adapters Count *
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                value={entry.count}
                                onChange={(e) => handleUpdateAdapterEntry(job.id, entry.id, 'count', Number(e.target.value))}
                                className="w-full text-xs font-bold p-2 pr-10 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                              />
                              <span className="absolute right-2.5 top-2 text-xs font-semibold text-slate-400">pcs</span>
                            </div>
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            {adapterEntries.length > 1 && (
                              <button
                                onClick={() => handleRemoveAdapterEntry(job.id, entry.id)}
                                className="p-2 rounded-md bg-rose-600/90 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                title="Remove Adapter row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SUCCESS NOTICE / CONFIRMATION BUTTON */}
                {isCompleted ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Assembly Confirmed! Automatically Deducted Inventory Stock
                      </span>
                      <Badge variant="completed">Passed to Installation</Badge>
                    </div>
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold pl-5">
                      • LEDs Deducted: {isCompleted.ledQty} pcs total ({isCompleted.ledSummary})<br />
                      • Adapters Deducted: {isCompleted.adapterQty} pcs total ({isCompleted.adapterSummary})
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="md"
                      variant="primary"
                      disabled={updateStageMutation.isPending || updateStockMutation.isPending}
                      onClick={() => handleConfirmBuildAndDeductStock(job)}
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      ⚡ Confirm Assembly & Deduct Stock from Inventory
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
