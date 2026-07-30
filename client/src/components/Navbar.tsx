import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from './ui/Button';
import {
  Plus,
  Calculator,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  LayoutDashboard,
  Kanban,
  Package,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { DialogTrigger, Popover } from 'react-aria-components';

interface NavbarProps {
  onOpenNewJob: () => void;
  onOpenEstimator: () => void;
}

export function Navbar({ onOpenNewJob, onOpenEstimator }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentPersona, setPersonaByRole, hasPermission } = useAuth();

  const isDesigner = currentPersona.role === 'DESIGNER';
  const canRunEstimator = hasPermission('RUN_ESTIMATOR') && !isDesigner;
  const canCreateJob = hasPermission('CREATE_JOB') && !isDesigner;

  const navLinks = [
    { label: 'My Workspace', to: '/', icon: LayoutDashboard },
    { label: 'Kanban Pipeline', to: '/jobs', icon: Kanban },
    { label: 'Inventory', to: '/inventory', icon: Package },
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#09090b]/95 px-4 sm:px-6 backdrop-blur-md transition-colors shadow-xs dark:shadow-none">
      {/* Brand & Top Navigation Tabs */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-black font-extrabold text-xs shadow-xs shrink-0 border border-yellow-500/50">
            FLX
          </div>
          <div className="font-heading text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            FILIX <span className="text-amber-600 dark:text-yellow-400 font-bold">ERP</span>
          </div>
        </Link>

        {/* Top Navbar Nav Tabs (Hidden for Designer persona to keep UI single-page & distraction-free) */}
        {!isDesigner && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  activeProps={{
                    className: 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white font-extrabold shadow-xs border border-slate-200 dark:border-zinc-700/80',
                  }}
                  inactiveProps={{
                    className: 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800/50',
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all select-none"
                >
                  <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-yellow-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Role Switcher Persona & Right Actions */}
      <div className="flex items-center gap-3">
        {/* Role Switcher & Persona Selector */}
        <div className="relative">
          <DialogTrigger>
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all text-xs cursor-pointer"
            >
              <div className="h-5 w-5 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-[10px]">
                {currentPersona.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-900 dark:text-white leading-none">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-yellow-400 font-semibold leading-tight mt-0.5">
                  {currentPersona.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </Button>
            <Popover className="w-64 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-2 shadow-2xl">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800/80 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-amber-600 dark:text-yellow-400" /> Switch Active User Persona
                </span>
              </div>
              <div className="space-y-0.5">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.id}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${currentPersona.role === persona.role
                        ? 'bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800/70 text-slate-700 dark:text-zinc-300'
                      }`}
                    onClick={() => setPersonaByRole(persona.role)}
                  >
                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {persona.avatar}
                    </div>
                    <div>
                      <div className="font-bold">{persona.name}</div>
                      <div className="text-[10px] text-amber-600 dark:text-yellow-400 font-semibold">
                        {persona.role.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {persona.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Popover>
          </DialogTrigger>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-xs"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>



        {canCreateJob && (
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenNewJob}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            <span className="hidden sm:inline">New Quote</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>
    </header>
  );
}
