import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '../utils/trpc';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useModals } from '../context/ModalContext';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  Trash2
} from 'lucide-react';
import { InventoryCategory } from '../../../server/src/types';

export const Route = createFileRoute('/inventory')({
  component: InventoryPage,
});

function InventoryPage() {
  const { openStockModal } = useModals();
  const [activeTab, setActiveTab] = useState<'catalog' | 'logs'>('catalog');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string } | null>(null);

  const { data: inventory = [], isLoading } = trpc.inventory.list.useQuery({
    search,
    category: categoryFilter !== 'ALL' ? (categoryFilter as InventoryCategory) : undefined,
    lowStockOnly
  });

  const { data: logs = [] } = trpc.inventory.getLogs.useQuery(
    { limit: 50 },
    { enabled: activeTab === 'logs' }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.inventory.delete.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
      setDeleteConfirmItem(null);
    }
  });

  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      deleteMutation.mutate({ id: deleteConfirmItem.id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Signage Shop Inventory & Stock
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage raw signage materials, monitor low-stock thresholds, and track job consumption logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Tab Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'catalog'
                  ? 'bg-yellow-400 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="h-3.5 w-3.5" /> Catalog ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'logs'
                  ? 'bg-yellow-400 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> Stock Movement Logs
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => openStockModal()}
            icon={<Plus className="h-4 w-4" />}
          >
            Add New Item
          </Button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
            <div className="sm:col-span-1">
              <Input
                placeholder="Search by SKU, Material Name, or Supplier..."
                icon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <Select
                options={[
                  { label: 'All Material Categories', value: 'ALL' },
                  { label: 'LED Modules & Strips', value: 'LED_MODULES' },
                  { label: 'Power Supplies & Transformers', value: 'POWER_SUPPLIES' },
                  { label: 'Acrylic & Substrates', value: 'ACRYLIC_SHEETS' },
                  { label: 'Aluminum Profiles & Channels', value: 'ALUMINUM_PROFILES' },
                  { label: 'Vinyl & Flex Banner', value: 'VINYL_FLEX' },
                  { label: 'Controllers & Dimmers', value: 'CONTROLLERS' },
                  { label: 'Fasteners & Hardware', value: 'FASTENERS' },
                ]}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none bg-zinc-800/80 px-3 py-2 rounded-lg border border-zinc-700 w-full justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" /> Show Low Stock Items Only
                </span>
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-yellow-400 focus:ring-yellow-400"
                />
              </label>
            </div>
          </div>

          {/* Catalog Table */}
          {isLoading ? (
            <div className="py-12 text-center text-zinc-400">Loading material catalog...</div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-900 text-zinc-400 font-semibold uppercase">
                    <tr>
                      <th className="p-3.5">SKU / Item Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Stock Level</th>
                      <th className="p-3.5">Bin Location</th>
                      <th className="p-3.5">Unit Cost</th>
                      <th className="p-3.5">Supplier</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-200">
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          No material inventory items match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      inventory.map((item: any) => {
                        const isLow = item.stockQuantity <= item.minReorderLevel;
                        return (
                          <tr key={item.id} className="hover:bg-zinc-900/60 transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-zinc-100">{item.name}</div>
                              <div className="text-[11px] text-zinc-400 font-mono">{item.sku}</div>
                            </td>
                            <td className="p-3.5 text-zinc-300">
                              <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] uppercase font-semibold text-zinc-400 border border-zinc-800">
                                {item.category.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className={`font-extrabold text-xs flex items-center gap-1.5 ${isLow ? 'text-yellow-400' : 'text-zinc-200'}`}>
                                {item.stockQuantity} {item.unit}
                                {isLow && (
                                  <Badge variant="amber" className="text-[9px] py-0 px-1.5">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-500">Min Alert: {item.minReorderLevel} {item.unit}</div>
                            </td>
                            <td className="p-3.5 font-medium text-zinc-300">{item.binLocation}</td>
                            <td className="p-3.5 font-semibold text-zinc-100">₹{item.unitCostPrice.toFixed(2)}</td>
                            <td className="p-3.5 text-zinc-400">{item.supplier}</td>
                            <td className="p-3.5 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openStockModal(item)}
                                >
                                  Adjust Qty
                                </Button>
                                <button
                                  onClick={() => setDeleteConfirmItem({ id: item.id, name: item.name })}
                                  className="text-zinc-500 hover:text-rose-400 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* STOCK LOGS TAB */
        <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 space-y-4">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-400" /> Audit Log: Inventory Adjustments & Job Deductions
          </h3>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900 text-zinc-400 font-semibold uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Material Item</th>
                  <th className="p-3">Movement Type</th>
                  <th className="p-3">Qty Changed</th>
                  <th className="p-3">Job Order</th>
                  <th className="p-3">Operator Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-zinc-900/60">
                    <td className="p-3 text-zinc-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-zinc-100">{log.itemName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {log.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`p-3 font-bold ${log.quantityChanged > 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                      {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                    </td>
                    <td className="p-3 font-mono text-yellow-400">{log.jobId || 'N/A'}</td>
                    <td className="p-3 text-zinc-300">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT DIALOG FOR INVENTORY DELETION */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Material Inventory Item"
        description={deleteConfirmItem ? `Are you sure you want to permanently remove "${deleteConfirmItem.name}" from the inventory catalog? This action will update stock tracking.` : ''}
        confirmText="Remove Material"
        cancelText="Keep Item"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
