import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useModals } from '../../context/ModalContext';
import { 
  UserCheck, 
  Plus, 
  DollarSign, 
  FileText, 
  Calculator,
  CheckCircle2,
  Calendar,
  Package,
  Clock,
  User,
  AlertTriangle,
  Layers,
  Search,
  Zap,
  Box
} from 'lucide-react';

interface StaffAttendance {
  id: string;
  name: string;
  role: string;
  status: 'PRESENT' | 'LATE' | 'ON_LEAVE' | 'ABSENT';
  clockInTime: string;
  notes: string;
}

const INITIAL_ATTENDANCE: StaffAttendance[] = [
  { id: 'EMP-101', name: 'Sarah Chen', role: 'Front Office & Admin Executive', status: 'PRESENT', clockInTime: '09:00 AM', notes: 'On Time' },
  { id: 'EMP-102', name: 'Dave Henderson', role: 'Production Supervisor', status: 'PRESENT', clockInTime: '08:45 AM', notes: 'Early Inspection Pass' },
  { id: 'EMP-103', name: 'Elena Rostova', role: 'Lead CAD & 3D Designer', status: 'PRESENT', clockInTime: '09:15 AM', notes: 'CAD Artwork Workstation' },
  { id: 'EMP-104', name: 'Marco Vance', role: 'Shop Floor Technician', status: 'PRESENT', clockInTime: '09:00 AM', notes: 'Shop Floor Assembly' },
  { id: 'EMP-105', name: 'Tom Kowalski', role: 'Field Installer & Tech', status: 'LATE', clockInTime: '09:40 AM', notes: 'Traffic delay on site dispatch' }
];

export function FrontOfficeDashboard() {
  const { openNewJob, openJobDetail, openEstimator } = useModals();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<'INTAKE' | 'ATTENDANCE' | 'INVENTORY'>('INTAKE');
  const [attendanceList, setAttendanceList] = useState<StaffAttendance[]>(INITIAL_ATTENDANCE);
  const [inventorySearch, setInventorySearch] = useState('');
  const [stockAdjustQty, setStockAdjustQty] = useState<{ [key: string]: number }>({});

  const { data: enquiries = [], isLoading } = trpc.jobs.list.useQuery({ stage: 'QUOTATION' });
  const { data: approvedJobs = [] } = trpc.jobs.list.useQuery({ stage: 'CUSTOMER_APPROVED' });
  const { data: inventory = [] } = trpc.inventory.list.useQuery({ search: inventorySearch });

  const updateStockMutation = trpc.inventory.updateStock.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
    }
  });

  const updateStageMutation = trpc.jobs.updateStage.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
    }
  });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Loading Front Office Terminal...</div>;
  }

  const handleUpdateAttendanceStatus = (empId: string, newStatus: 'PRESENT' | 'LATE' | 'ON_LEAVE' | 'ABSENT') => {
    setAttendanceList(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          status: newStatus,
          clockInTime: newStatus === 'ABSENT' ? '--:--' : emp.clockInTime === '--:--' ? '09:00 AM' : emp.clockInTime
        };
      }
      return emp;
    }));
  };

  const handleStockAdjustment = (itemId: string, currentQty: number, change: number) => {
    const newQty = Math.max(0, currentQty + change);
    updateStockMutation.mutate({
      id: itemId,
      stockQuantity: newQty,
      notes: `Front Office stock adjustment (${change > 0 ? '+' : ''}${change}) by Sarah Chen`
    });
  };

  const presentCount = attendanceList.filter(e => e.status === 'PRESENT').length;
  const lateCount = attendanceList.filter(e => e.status === 'LATE').length;
  const leaveCount = attendanceList.filter(e => e.status === 'ON_LEAVE').length;
  const absentCount = attendanceList.filter(e => e.status === 'ABSENT').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#141417] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-amber-600 dark:text-yellow-400" /> Front Office & Admin Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Active Persona: <span className="font-bold text-amber-600 dark:text-yellow-400">Sarah Chen (Front Office Executive)</span> — Manage client quotation intake, employee daily attendance, and warehouse material inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={openNewJob}
            icon={<Plus className="h-4 w-4" />}
          >
            Intake Quotation
          </Button>
        </div>
      </div>

      {/* 3 WORKSTATION TABS */}
      <div className="flex bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('INTAKE')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'INTAKE'
              ? 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          <span>1. Quotations & Intake ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ATTENDANCE'
              ? 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          <span>2. Employee Attendance ({presentCount}/{attendanceList.length} Present)</span>
        </button>

        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'INVENTORY'
              ? 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          <span>3. Material Inventory Catalog ({inventory.length} Items)</span>
        </button>
      </div>

      {/* TAB 1: QUOTATIONS & INTAKE */}
      {activeTab === 'INTAKE' && (
        <div className="space-y-6">
          {/* KPI Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Quotation Intake Queue"
              value={enquiries.length}
              subtitle="Bare-minimum intake quotes pending approval"
              icon={<FileText className="h-5 w-5" />}
              trend="Pending Deposit"
              trendType="neutral"
            />

            <StatCard
              title="Approved Customer Orders"
              value={approvedJobs.length}
              subtitle="Ready for supervisor site survey"
              icon={<DollarSign className="h-5 w-5" />}
              trend="Approved"
              trendType="positive"
            />

            <StatCard
              title="50% Deposit Payments"
              value={`₹${(approvedJobs.reduce((sum: number, j: any) => sum + (j.financials?.depositPaid || 0), 0) + 65000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              subtitle="Upfront client commitments"
              icon={<CheckCircle2 className="h-5 w-5" />}
              trend="Collected"
              trendType="positive"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
                  <h3 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Recent Quotation Intake ({enquiries.length})
                  </h3>
                </div>

                {enquiries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    No pending quotation intake items.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enquiries.map((job: any) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-600 dark:text-yellow-400 text-xs">{job.id}</span>
                              <Badge variant="enquiry">Quotation Intake</Badge>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{job.companyName || job.customerName}</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{job.siteAddress}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openJobDetail(job.id)}
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={updateStageMutation.isPending}
                              onClick={() => {
                                updateStageMutation.mutate({
                                  id: job.id,
                                  stage: 'CUSTOMER_APPROVED'
                                });
                              }}
                              icon={<CheckCircle2 className="h-4 w-4" />}
                            >
                              ⚡ Quick Approve & Pass to Supervisor
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Customer Contact</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{job.customerName} ({job.phone})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Signage Type</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{job.signType.replace(/_/g, ' ')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Total Quote Amount</span>
                            <span className="font-bold text-amber-600 dark:text-yellow-400">₹{job.financials?.totalQuoteAmount?.toLocaleString('en-IN') || '75,000'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 space-y-3 shadow-xs">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> New Quotation Quick Action
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Create a bare-minimum quotation intake record (Client name, Phone, Site Location, Signage Type, Total Quote Amount).
                </p>
                <Button
                  size="md"
                  variant="amber"
                  onClick={openNewJob}
                  icon={<Plus className="h-4 w-4" />}
                  className="w-full"
                >
                  Create New Quotation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE ATTENDANCE MANAGEMENT */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-5">
          {/* Attendance KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-300/40 dark:border-emerald-800 bg-emerald-500/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">Present Today</span>
              <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">{presentCount} Staff</span>
            </div>

            <div className="p-3.5 rounded-xl border border-yellow-300/40 dark:border-yellow-800 bg-yellow-500/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-yellow-400 block">Late Arrivals</span>
              <span className="text-lg font-extrabold text-amber-900 dark:text-yellow-200">{lateCount} Staff</span>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-300/40 dark:border-blue-800 bg-blue-500/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 block">On Leave</span>
              <span className="text-lg font-extrabold text-blue-900 dark:text-blue-200">{leaveCount} Staff</span>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-300/40 dark:border-rose-800 bg-rose-500/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">Absent</span>
              <span className="text-lg font-extrabold text-rose-900 dark:text-rose-200">{absentCount} Staff</span>
            </div>
          </div>

          {/* Staff Attendance Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Daily Employee Attendance Roster ({attendanceList.length} Team Members)
              </h3>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Date: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="pb-2">Employee ID & Name</th>
                    <th className="pb-2">Designation / Role</th>
                    <th className="pb-2">Clock In Time</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Remarks / Notes</th>
                    <th className="pb-2 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {attendanceList.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
                          <div>
                            <div>{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">{emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-zinc-400 font-medium">{emp.role}</td>
                      <td className="py-3 font-mono font-semibold text-slate-800 dark:text-zinc-200">{emp.clockInTime}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          emp.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : emp.status === 'LATE'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-yellow-400 border-amber-500/30'
                            : emp.status === 'ON_LEAVE'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-zinc-400 text-[11px]">{emp.notes}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdateAttendanceStatus(emp.id, 'PRESENT')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleUpdateAttendanceStatus(emp.id, 'LATE')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500 text-slate-950 hover:bg-yellow-400 cursor-pointer"
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleUpdateAttendanceStatus(emp.id, 'ON_LEAVE')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                          >
                            Leave
                          </button>
                          <button
                            onClick={() => handleUpdateAttendanceStatus(emp.id, 'ABSENT')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WAREHOUSE INVENTORY MANAGEMENT */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#141417] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory SKU or material name..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white"
              />
            </div>

            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
              Showing {inventory.length} warehouse items
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 space-y-4 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="pb-2">SKU & Item Name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Current Stock</th>
                    <th className="pb-2">Bin Location</th>
                    <th className="pb-2 text-right">Stock Adjustments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {inventory.map((item: any) => {
                    const isLow = item.stockQuantity <= item.minReorderLevel;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          <div>
                            <div>{item.name}</div>
                            <div className="text-[10px] text-amber-600 dark:text-yellow-400 font-mono font-normal">{item.sku}</div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-zinc-400 font-medium">
                          <Badge variant="amber">{item.category.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {item.stockQuantity} <span className="text-xs font-semibold text-slate-400">{item.unit}</span>
                            </span>
                            {isLow && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/30">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-600 dark:text-zinc-400">{item.binLocation || 'Rack A-01'}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStockAdjustment(item.id, item.stockQuantity, 10)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Add 10 units"
                            >
                              +10 Stock In
                            </button>
                            <button
                              onClick={() => handleStockAdjustment(item.id, item.stockQuantity, -10)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-slate-950 hover:bg-yellow-400 cursor-pointer"
                              title="Deduct 10 units"
                            >
                              -10 Stock Out
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
