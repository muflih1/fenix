import {createFileRoute} from '@tanstack/react-router';
import {SupervisorDashboard} from '../features/supervisor/components/SupervisorDashboard';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <SupervisorDashboard />;
}
