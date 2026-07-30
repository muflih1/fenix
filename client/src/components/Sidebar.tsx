import React from 'react';
import {Link, useLocation} from '@tanstack/react-router';
import {
  LayoutDashboard,
  Kanban,
  Package,
  Calculator,
  X,
  ShieldCheck,
  Palette,
  Ruler,
  Wrench,
  UserCheck,
} from 'lucide-react';
import {trpc} from '../utils/trpc';
import {cn} from '../utils/cn';
import {useAuth} from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({isOpen, onClose}: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const {currentPersona, canAccessRoute} = useAuth();

  const {data: metrics} = trpc.analytics.getDashboardMetrics.useQuery();
  const lowStockCount = metrics?.inventorySummary?.lowStockCount || 0;
  const activeJobsCount = metrics?.activeJobsCount || 0;

  const role = currentPersona.role;

  // Tailored role-specific sidebar menus
  const getNavItemsForRole = () => {
    switch (role) {
      case 'DESIGNER':
        return [
          {
            label: 'Design Studio Queue',
            icon: Palette,
            to: '/',
            badge: null,
          },
          {
            label: 'Design & Survey Pipeline',
            icon: Kanban,
            to: '/jobs',
            badge: activeJobsCount > 0 ? activeJobsCount : null,
            badgeColor:
              'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
          },
        ];

      case 'TECHNICIAN':
        return [
          {
            label: 'Shop Floor Assembly',
            icon: Wrench,
            to: '/',
            badge: null,
          },
          {
            label: 'Production & Installs',
            icon: Kanban,
            to: '/jobs',
            badge: activeJobsCount > 0 ? activeJobsCount : null,
            badgeColor:
              'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
          },
          {
            label: 'Inventory Materials',
            icon: Package,
            to: '/inventory',
            badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
            badgeColor:
              'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30',
          },
        ];

      case 'FRONT_OFFICE':
        return [
          {
            label: 'Sales & Intake Console',
            icon: UserCheck,
            to: '/',
            badge: null,
          },
          {
            label: 'All Signage Orders',
            icon: Kanban,
            to: '/jobs',
            badge: activeJobsCount > 0 ? activeJobsCount : null,
            badgeColor:
              'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
          },
          {
            label: 'Material Catalog',
            icon: Package,
            to: '/inventory',
            badge: null,
          },
        ];

      case 'SUPERVISOR':
        return [
          {
            label: 'Supervisor Command',
            icon: ShieldCheck,
            to: '/',
            badge: null,
          },
          {
            label: 'All Signage Orders',
            icon: Kanban,
            to: '/jobs',
            badge: activeJobsCount > 0 ? activeJobsCount : null,
            badgeColor:
              'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
          },
          {
            label: 'Material Stock & Reorders',
            icon: Package,
            to: '/inventory',
            badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
            badgeColor:
              'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30',
          },
        ];

      case 'MANAGER':
      default:
        return [
          {
            label: 'Executive Dashboard',
            icon: LayoutDashboard,
            to: '/',
            badge: null,
          },
          {
            label: 'Workflow Pipeline',
            icon: Kanban,
            to: '/jobs',
            badge: activeJobsCount > 0 ? activeJobsCount : null,
            badgeColor:
              'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
          },
          {
            label: 'Inventory & Materials',
            icon: Package,
            to: '/inventory',
            badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
            badgeColor:
              'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30',
          },
        ];
    }
  };

  const navItems = getNavItemsForRole().filter(item => canAccessRoute(item.to));

  const sidebarContent = (
    <div className='flex flex-col justify-between h-full p-4'>
      <div className='space-y-5'>
        <div className='flex items-center justify-between px-2'>
          <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500'>
            {role.replace('_', ' ')} Jurisdiction Menu
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className='md:hidden p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        <nav className='space-y-1'>
          {navItems.map(item => {
            const isActive =
              currentPath === item.to ||
              (item.to !== '/' && currentPath.startsWith(item.to));
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all group border border-solid border-transparent',
                  isActive
                    ? 'bg-yellow-400/20 dark:bg-zinc-900 text-amber-900 dark:text-yellow-400 font-bold border-yellow-400/50 dark:border-zinc-800 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-200',
                )}
              >
                <div className='flex items-center gap-2.5'>
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive
                        ? 'text-amber-700 dark:text-yellow-400'
                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300',
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                      item.badgeColor,
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className='rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/40 p-3 space-y-1.5 mt-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200'>
            <ShieldCheck className='h-4 w-4 text-amber-600 dark:text-yellow-400' />
            <span>Active Persona</span>
          </div>
        </div>
        <div className='text-[11px] font-semibold text-slate-900 dark:text-white truncate'>
          {currentPersona.name}
        </div>
        <div className='inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-yellow-100 dark:bg-yellow-400/10 text-yellow-900 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-400/30'>
          {currentPersona.role.replace('_', ' ')}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className='hidden md:flex w-60 border-r border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#09090b] flex-col shrink-0 min-h-[calc(100vh-3.5rem)] transition-colors'>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className='fixed inset-0 z-50 md:hidden flex'>
          <div
            className='fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm transition-opacity'
            onClick={onClose}
          />
          <aside className='relative w-64 max-w-[80vw] bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-zinc-800 h-full z-10 shadow-2xl flex flex-col'>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
