import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { ManagerDashboard } from '../components/dashboards/ManagerDashboard';
import { SupervisorDashboard } from '../components/dashboards/SupervisorDashboard';
import { FrontOfficeDashboard } from '../components/dashboards/FrontOfficeDashboard';
import { DesignerDashboard } from '../components/dashboards/DesignerDashboard';
import { TechnicianDashboard } from '../components/dashboards/TechnicianDashboard';

export const Route = createFileRoute('/')({
  component: DashboardDispatcher,
});

function DashboardDispatcher() {
  const { currentPersona } = useAuth();

  switch (currentPersona.role) {
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'SUPERVISOR':
      return <SupervisorDashboard />;
    case 'FRONT_OFFICE':
      return <FrontOfficeDashboard />;
    case 'DESIGNER':
      return <DesignerDashboard />;
    case 'TECHNICIAN':
      return <TechnicianDashboard />;
    default:
      return <ManagerDashboard />;
  }
}
