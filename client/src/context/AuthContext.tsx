import React, { createContext, useContext, useState } from 'react';

export type UserRole = 
  | 'MANAGER' 
  | 'SUPERVISOR' 
  | 'FRONT_OFFICE' 
  | 'DESIGNER' 
  | 'TECHNICIAN';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
}

export const DEMO_PERSONAS: UserPersona[] = [
  {
    id: 'usr-1',
    name: 'Marcus Vance',
    email: 'marcus@filixsign.com',
    role: 'MANAGER',
    avatar: 'MV',
    title: 'Shop Owner & General Manager'
  },
  {
    id: 'usr-2',
    name: 'Dave Henderson',
    email: 'dave@filixsign.com',
    role: 'SUPERVISOR',
    avatar: 'DH',
    title: 'Shop Floor & Site Survey Supervisor'
  },
  {
    id: 'usr-3',
    name: 'Sarah Chen',
    email: 'sarah@filixsign.com',
    role: 'FRONT_OFFICE',
    avatar: 'SC',
    title: 'Sales & Front Office Intake'
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena@filixsign.com',
    role: 'DESIGNER',
    avatar: 'ER',
    title: 'Lead CAD & 3D Signage Designer'
  },
  {
    id: 'usr-5',
    name: 'Tom Kowalski',
    email: 'tom@filixsign.com',
    role: 'TECHNICIAN',
    avatar: 'TK',
    title: 'LED Fabrication Tech & Lead Installer'
  }
];

interface AuthContextType {
  currentPersona: UserPersona;
  setPersonaByRole: (role: UserRole) => void;
  hasPermission: (permission: PermissionAction) => boolean;
  canAccessRoute: (routePath: string) => boolean;
}

export type PermissionAction =
  | 'CREATE_JOB'
  | 'VIEW_FINANCIALS'
  | 'EDIT_FINANCIALS'
  | 'ADVANCE_STAGE'
  | 'UPLOAD_MOCKUPS'
  | 'UPDATE_SITE_SPECS'
  | 'UPDATE_PRODUCTION_SUBSTATUS'
  | 'MANAGE_DISPATCH'
  | 'MANAGE_INVENTORY'
  | 'ADJUST_STOCK'
  | 'DELETE_ITEM'
  | 'RUN_ESTIMATOR';

const ThemeContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    const savedRole = localStorage.getItem('filix_erp_role');
    const matched = DEMO_PERSONAS.find(p => p.role === savedRole);
    return matched || DEMO_PERSONAS[0]; // Default to Manager
  });

  const setPersonaByRole = (role: UserRole) => {
    const matched = DEMO_PERSONAS.find(p => p.role === role);
    if (matched) {
      setCurrentPersona(matched);
      localStorage.setItem('filix_erp_role', role);
    }
  };

  const hasPermission = (permission: PermissionAction): boolean => {
    const role = currentPersona.role;

    switch (permission) {
      case 'CREATE_JOB':
        return ['MANAGER', 'FRONT_OFFICE'].includes(role);

      case 'VIEW_FINANCIALS':
        return ['MANAGER', 'SUPERVISOR', 'FRONT_OFFICE'].includes(role);

      case 'EDIT_FINANCIALS':
        return ['MANAGER', 'FRONT_OFFICE'].includes(role);

      case 'ADVANCE_STAGE':
        return ['MANAGER', 'SUPERVISOR', 'FRONT_OFFICE'].includes(role);

      case 'UPLOAD_MOCKUPS':
        return ['MANAGER', 'DESIGNER'].includes(role);

      case 'UPDATE_SITE_SPECS':
        return ['MANAGER', 'SUPERVISOR'].includes(role);

      case 'UPDATE_PRODUCTION_SUBSTATUS':
        return ['MANAGER', 'SUPERVISOR', 'TECHNICIAN'].includes(role);

      case 'MANAGE_DISPATCH':
        return ['MANAGER', 'SUPERVISOR', 'TECHNICIAN'].includes(role);

      case 'MANAGE_INVENTORY':
      case 'ADJUST_STOCK':
        return ['MANAGER', 'SUPERVISOR', 'TECHNICIAN', 'FRONT_OFFICE'].includes(role);

      case 'DELETE_ITEM':
        return ['MANAGER'].includes(role);

      case 'RUN_ESTIMATOR':
        return ['MANAGER', 'SUPERVISOR', 'FRONT_OFFICE'].includes(role);

      default:
        return false;
    }
  };

  const canAccessRoute = (routePath: string): boolean => {
    const role = currentPersona.role;

    if (role === 'MANAGER') return true;
    if (routePath === '/') return true;
    if (routePath === '/jobs') return true;

    if (routePath === '/inventory') {
      return ['MANAGER', 'SUPERVISOR', 'TECHNICIAN', 'FRONT_OFFICE'].includes(role);
    }

    if (routePath === '/estimator') {
      return ['MANAGER', 'SUPERVISOR', 'FRONT_OFFICE'].includes(role);
    }

    return true;
  };

  return (
    <ThemeContext.Provider value={{ currentPersona, setPersonaByRole, hasPermission, canAccessRoute }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
