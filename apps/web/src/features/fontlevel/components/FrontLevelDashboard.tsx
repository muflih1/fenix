import { EmployeeAttendanceRegisterCard } from "./EmployeeAttendanceRegisterCard";
import { QuotationsCard } from "./QuotationsCard";

export function FrontLevelDashboard() {
  return (
    <div className='max-w-7xl mx-auto w-full px-4 py-6'>
      <div className='grid w-full grid-cols-1 lg:grid-cols-2 gap-6'>
        <QuotationsCard />
        <EmployeeAttendanceRegisterCard />
      </div>
    </div>
  );
}