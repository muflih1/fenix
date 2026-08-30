import {IconCalendarClock} from '@tabler/icons-react';
import {Button} from '../../../components/Button';
import {useTRPC} from '../../../utils/trpc';
import {useQuery} from '@tanstack/react-query';
import {Skeleton} from '../../../components/Skeleton';
import {formatEmployeeRole} from '../lib/formatter';

export function EmployeeAttendanceRegisterCard() {
  const trpc = useTRPC();
  const {data: employees, isLoading} = useQuery(
    trpc.employees.list.queryOptions(),
  );

  return (
    <div className='w-full rounded-3xl border border-(--divider) p-4'>
      <div className='flex items-center justify-between border-b border-b-(--divider) pb-2 mb-2'>
        <h3 className='text-lg font-bold text-primary flex items-center space-x-1'>
          <IconCalendarClock />
          <span>Employee Attendance Register</span>
        </h3>
      </div>
      <ul>
        {isLoading &&
          Array(2)
            .fill('')
            .map((_, i) => (
              <li key={i}>
                <div className='group-last/item:border-b-0 border-b border-b-(--divider) flex items-center justify-center py-3.5'>
                  <div className='flex flex-col shrink grow min-w-0 space-y-1'>
                    <Skeleton className='h-5 w-30' />
                    <Skeleton className='h-4 w-38' />
                    <div className='flex items-center space-x-1'>
                      <Skeleton className='size-4 rounded-md' />
                      <Skeleton className='h-4 w-34' />
                    </div>
                    <Skeleton className='h-4 w-28' />
                  </div>
                  <div className='shrink-0 ml-4 flex items-center self-stretch space-x-1'>
                    <Skeleton className='h-9 w-28 rounded-full' />
                    <Skeleton className='h-9 w-20 rounded-full' />
                  </div>
                </div>
              </li>
            ))}
        {employees?.map(employee => (
          <li key={employee.id} className='group/item'>
            <div className='group-last/item:border-b-0 border-b border-b-(--divider) flex items-center justify-center py-3.5'>
              <div className='flex flex-row shrink grow min-w-0 space-y-0.75'>
                <div></div>
                <div className='flex flex-col'>
                  <span className='txet-sm font-bold'>{employee.name}</span>
                  <span className='text-xs font-medium text-secondary-foreground'>
                    {formatEmployeeRole(employee.role)}
                  </span>
                </div>
              </div>
              <div className='shrink-0 ml-4 flex items-center self-stretch space-x-1'>
                <Button>Present</Button>
                <Button>Absent</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
