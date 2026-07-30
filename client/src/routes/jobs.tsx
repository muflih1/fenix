import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '../utils/trpc';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useModals } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { DesignerDashboard } from '../components/dashboards/DesignerDashboard';
import { 
  Kanban, 
  List, 
  Plus, 
  Search, 
  Clock, 
  Ruler, 
  Layers
} from 'lucide-react';
import { WorkflowStage } from '../../../server/src/types';

export const Route = createFileRoute('/jobs')({
  component: JobsPage,
});

const STAGES: { label: string; value: WorkflowStage; color: string }[] = [
  { label: '1. Quotation', value: 'QUOTATION', color: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800' },
  { label: '2. Customer Approved', value: 'CUSTOMER_APPROVED', color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold' },
  { label: '3. Site Survey', value: 'SITE_SURVEY', color: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30' },
  { label: '4. Design & CAD', value: 'DESIGN_MOCKUP', color: 'bg-amber-100 dark:bg-yellow-400/10 text-amber-800 dark:text-yellow-400 border-amber-300 dark:border-yellow-400/30' },
  { label: '5. Production', value: 'PRODUCTION', color: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30' },
  { label: '6. Installation', value: 'INSTALLATION', color: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30' },
  { label: '7. Completed', value: 'COMPLETED', color: 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-black border-slate-800 dark:border-zinc-200 font-bold' },
];

function JobsPage() {
  const { currentPersona } = useAuth();
  const { openNewJob, openJobDetail } = useModals();

  if (currentPersona.role === 'DESIGNER') {
    return <DesignerDashboard />;
  }
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery({
    search,
    stage: stageFilter !== 'ALL' ? (stageFilter as WorkflowStage) : undefined
  });

  const utils = trpc.useUtils();
  const updateStageMutation = trpc.jobs.updateStage.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: WorkflowStage) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId) {
      updateStageMutation.mutate({ id: jobId, stage: targetStage });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Signage Workflow & Job Orders Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sequence: <span className="text-yellow-400 font-semibold">1. Quotation ➔ 2. Customer Approved ➔ 3. Site Survey ➔ 4. Design & CAD ➔ 5. Production ➔ 6. Installation ➔ 7. Completed</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-yellow-400 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Kanban Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-yellow-400 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Table List View
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => openNewJob()}
            icon={<Plus className="h-4 w-4" />}
          >
            Create New Quote
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by Job ID (#JOB-1001), Customer, Company, or Signage Title..."
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <Select
            options={[
              { label: 'All Workflow Stages', value: 'ALL' },
              { label: '1. Enquiry & Quote', value: 'ENQUIRY_QUOTATION' },
              { label: '2. Customer Approved', value: 'CUSTOMER_APPROVED' },
              { label: '3. Site Survey', value: 'SITE_SURVEY' },
              { label: '4. Design & CAD', value: 'DESIGN_MOCKUP' },
              { label: '5. Production', value: 'PRODUCTION' },
              { label: '6. Installation', value: 'INSTALLATION' },
              { label: '7. Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          />
        </div>
      </div>

      {/* MAIN VIEW: KANBAN vs LIST TABLE */}
      {isLoading ? (
        <div className="py-12 text-center text-zinc-400">Loading signage workflow pipeline...</div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageJobs = jobs.filter((j: any) => j.stage === stage.value);
            return (
              <div
                key={stage.value}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.value)}
                className="bg-[#141417] rounded-xl border border-zinc-800 p-3 flex flex-col min-h-[500px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                  <h3 className="font-heading text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    {stage.label}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-zinc-900 text-yellow-400 border border-zinc-800">
                    {stageJobs.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1">
                  {stageJobs.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-zinc-600 border border-dashed border-zinc-800/80 rounded-lg">
                      Drop orders here
                    </div>
                  ) : (
                    stageJobs.map((job: any) => (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', job.id)}
                        onClick={() => openJobDetail(job.id)}
                        className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer space-y-2 shadow-xs group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-yellow-400 font-mono">
                            {job.id}
                          </span>
                          {job.priority !== 'NORMAL' && (
                            <Badge variant="urgent" className="text-[9px] py-0 px-1">
                              {job.priority}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-yellow-400 transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400">{job.companyName || job.customerName}</p>
                        </div>

                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 pt-1 border-t border-zinc-800/80">
                          <Layers className="h-3 w-3 text-zinc-500" />
                          <span>{job.signType.replace(/_/g, ' ')}</span>
                        </div>

                        {job.assignedDesignerName && (
                          <div className="text-[10px] text-amber-600 dark:text-yellow-400 font-semibold pt-0.5">
                            Designer: {job.assignedDesignerName}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                          <span>{job.dimensions.width}x{job.dimensions.height} {job.dimensions.unit}</span>
                          <span className="font-bold text-zinc-200">₹{job.financials.totalQuoteAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900 text-zinc-400 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">Job ID & Title</th>
                  <th className="p-3.5">Customer / Company</th>
                  <th className="p-3.5">Signage Specs</th>
                  <th className="p-3.5">Workflow Stage</th>
                  <th className="p-3.5">Assigned Designer</th>
                  <th className="p-3.5">Quote Amount</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      No signage jobs match your search criteria.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-yellow-400 font-mono text-[11px]">{job.id}</div>
                        <div className="font-semibold text-zinc-100">{job.title}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-zinc-200">{job.companyName || job.customerName}</div>
                        <div className="text-[11px] text-zinc-400">{job.phone}</div>
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        <div>{job.signType.replace(/_/g, ' ')}</div>
                        <div className="text-[11px] text-zinc-400">{job.dimensions.width}x{job.dimensions.height} {job.dimensions.unit}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant={job.stage.toLowerCase() as any}>
                          {job.stage.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">
                        {job.assignedDesignerName || 'Unassigned'}
                      </td>
                      <td className="p-3.5 font-bold text-zinc-100">₹{job.financials.totalQuoteAmount.toLocaleString()}</td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openJobDetail(job.id)}
                        >
                          Manage Order
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
