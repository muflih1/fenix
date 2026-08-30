import {createFileRoute} from '@tanstack/react-router';
import {FrontLevelDashboard} from '../features/fontlevel/components/FrontLevelDashboard';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <FrontLevelDashboard />;
}
