import React from 'react';
import { trpc } from '../../utils/trpc';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useModals } from '../../context/ModalContext';
import { Link } from '@tanstack/react-router';
import { 
  Kanban, 
  Package, 
  Wrench, 
  AlertTriangle, 
  Plus, 
  Calculator, 
  Clock, 
  ChevronRight, 
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 shadow-xs transition-all ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80 mb-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-heading text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 ${className}`}>{children}</h3>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

const PIE_COLORS = ['#eab308', '#f59e0b', '#d97706', '#84cc16', '#06b6d4', '#6366f1'];

export function ManagerDashboard() {
  const { openNewJob, openEstimator, openJobDetail, openStockModal } = useModals();

  const { data: metrics, isLoading: loadingMetrics } = trpc.analytics.getDashboardMetrics.useQuery();
  const { data: analytics, isLoading: loadingAnalytics } = trpc.analytics.getManagerAnalytics.useQuery();
  const { data: recentJobs = [] } = trpc.jobs.list.useQuery({});

  if (loadingMetrics || !metrics || loadingAnalytics || !analytics) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 dark:border-yellow-400 border-t-transparent"></div>
          <span>Loading Executive Telemetry & Trends...</span>
        </div>
      </div>
    );
  }

  const { stageCounts, inventorySummary, recentActivity = [] } = metrics;
  const { monthlyRevenue, signTypeDistribution, stageFunnel, topMaterials } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#141417] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-yellow-400" /> Executive Analytics & Operations Terminal
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Active Persona: <span className="font-bold text-amber-600 dark:text-yellow-400">Marcus Vance (Shop Owner & General Manager)</span> — Revenue cashflow trends (INR ₹), job conversion analytics, and shop telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={openNewJob}
            icon={<Plus className="h-4 w-4" />}
          >
            New Enquiry
          </Button>
        </div>
      </div>

      {/* KPI Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Signage Jobs"
          value={metrics.activeJobsCount}
          subtitle="Orders currently in shop pipeline"
          icon={<Kanban className="h-5 w-5" />}
          trend="In Shop"
          trendType="neutral"
        />

        <StatCard
          title="Monthly Pipeline Value"
          value={`₹${metrics.totalPipelineValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Quotes & production orders"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+18%"
          trendType="positive"
        />

        <StatCard
          title="Inventory Items"
          value={inventorySummary.totalItemsCount}
          subtitle={`Valued at ₹${inventorySummary.totalInventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={<Package className="h-5 w-5" />}
          trend="In Stock"
          trendType="positive"
        />

        <StatCard
          title="Low Stock Reorders"
          value={inventorySummary.lowStockCount}
          subtitle="Materials below minimum threshold"
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={inventorySummary.lowStockCount > 0 ? 'Action Needed' : 'Healthy'}
          trendType={inventorySummary.lowStockCount > 0 ? 'warning' : 'positive'}
        />
      </div>

      {/* MANAGER EXCLUSIVE CHARTS & TRENDS REPORTING SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Executive Financial & Operations Trends (INR ₹)
          </h2>
          <span className="text-xs text-slate-500 dark:text-zinc-400">Live Shop Telemetry Data</span>
        </div>

        {/* Top 2 Charts: Revenue Cashflow & Sign Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Monthly Revenue & Cashflow Trend (2 Cols) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> 6-Month Quoted vs Collected Revenue (₹ INR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQuoted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141417', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    />
                    <Area type="monotone" dataKey="quoted" name="Total Quoted (₹)" stroke="#eab308" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQuoted)" />
                    <Area type="monotone" dataKey="collected" name="Cash Collected (₹)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Signage Type Distribution (1 Col) */}
          <Card>
            <CardHeader>
              <CardTitle>
                <PieChartIcon className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Orders by Sign Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={signTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {signTypeDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141417', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px]">
                {signTypeDistribution.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="truncate">{entry.name} ({entry.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom 2 Charts: Stage Funnel & Material Valuation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Pipeline Stage Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Kanban className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Workflow Stage Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageFunnel} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                    <XAxis dataKey="stage" stroke="#71717a" fontSize={10} tickFormatter={(val) => val.split('.')[1] || val} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141417', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" name="Signage Orders" fill="#eab308" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 4: Inventory Valuation Velocity */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Package className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Top Inventory Valuation (₹ INR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMaterials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141417', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Total Valuation']}
                    />
                    <Bar dataKey="totalValuation" name="Stock Value (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid: Active Jobs & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Signage Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                <Wrench className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Recent Signage Orders
              </CardTitle>
              <Link to="/jobs" className="text-xs font-semibold text-amber-600 dark:text-yellow-400 hover:underline">
                View All ({recentJobs.length})
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Job ID</th>
                      <th className="p-3">Client / Title</th>
                      <th className="p-3">Sign Type</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Quote</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                    {recentJobs.slice(0, 6).map((job: any) => (
                      <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                        <td className="p-3 font-bold text-amber-600 dark:text-yellow-400">{job.id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900 dark:text-zinc-100">{job.companyName || job.customerName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">{job.title}</div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-zinc-300">{job.signType.replace(/_/g, ' ')}</td>
                        <td className="p-3">
                          <Badge variant={job.stage.toLowerCase() as any}>
                            {job.stage.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-zinc-100">
                          ₹{job.financials.totalQuoteAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openJobDetail(job.id)}
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Low Stock Alerts & Stock Movement Feed */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <Card className="border-amber-300 dark:border-yellow-400/30">
            <CardHeader>
              <CardTitle className="text-amber-700 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" /> Low Stock Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventorySummary.lowStockItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-zinc-200" />
                  All inventory stock levels are healthy!
                </div>
              ) : (
                <div className="space-y-3">
                  {inventorySummary.lowStockItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-zinc-200">{item.name}</div>
                        <div className="text-[10px] text-amber-700 dark:text-yellow-400 font-bold mt-0.5">
                          In Stock: {item.stockQuantity} {item.unit} (Min: {item.minReorderLevel})
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="amber"
                        onClick={() => openStockModal(item)}
                      >
                        Adjust
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Stock Movement Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-zinc-300">
                <Clock className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> Stock Movement History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((log: any) => (
                <div key={log.id} className="text-xs border-b border-slate-100 dark:border-zinc-800/60 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{log.itemName}</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        log.quantityChanged > 0
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700'
                          : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                      }`}
                    >
                      {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{log.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
