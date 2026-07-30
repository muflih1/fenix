import React from 'react';
import { trpc } from '../../utils/trpc';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useModals } from '../../context/ModalContext';
import { 
  Ruler, 
  Calculator, 
  MapPin, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

export function SurveyorDashboard() {
  const { openJobDetail, openEstimator } = useModals();

  const { data: surveyJobs = [], isLoading } = trpc.jobs.list.useQuery({ stage: 'SITE_SURVEY' });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Loading Site Inspector Terminal...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#141417] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Ruler className="h-6 w-6 text-amber-600 dark:text-yellow-400" /> Site Surveyor & Inspection Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Active Persona: <span className="font-bold text-amber-600 dark:text-yellow-400">Jake Miller (Site Inspector)</span> — Manage on-site wall dimensions, mounting access, and site inspection photos.
          </p>
        </div>
      </div>

      {/* KPI Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Site Surveys"
          value={surveyJobs.length}
          subtitle="Customer sites awaiting physical measurements"
          icon={<MapPin className="h-5 w-5" />}
          trend="Action Needed"
          trendType={surveyJobs.length > 0 ? 'warning' : 'positive'}
        />

        <StatCard
          title="BOM Estimator Specs"
          value={12}
          subtitle="Material calculations generated"
          icon={<Calculator className="h-5 w-5" />}
          trend="Ready"
          trendType="positive"
        />

        <StatCard
          title="Inspections Completed"
          value={18}
          subtitle="Verified wall depth & mounting access"
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="Complete"
          trendType="positive"
        />
      </div>

      {/* Main Grid: Survey Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
              <h3 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Active Site Survey Inspections Queue ({surveyJobs.length})
              </h3>
            </div>

            {surveyJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                All pending site inspections are completed!
              </div>
            ) : (
              <div className="space-y-3">
                {surveyJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-600 dark:text-yellow-400 text-xs">{job.id}</span>
                          <Badge variant="survey">Survey & Design</Badge>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{job.companyName || job.customerName}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{job.siteAddress}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="amber"
                        onClick={() => openJobDetail(job.id)}
                        icon={<Ruler className="h-3.5 w-3.5" />}
                      >
                        Input Site Specs
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Sign Type</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{job.signType.replace(/_/g, ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Client Phone</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{job.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Mounting Type</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{job.installationType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Estimator Launch */}
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-300 dark:border-yellow-400/40 bg-amber-500/5 p-5 space-y-3 shadow-xs">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Quick On-Site BOM Calculator
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Calculate LED module quantities, transformer wattage, and substrate sheet counts right from the inspection site.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={openEstimator}
              icon={<Layers className="h-4 w-4" />}
              className="w-full"
            >
              Open BOM Estimator
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
