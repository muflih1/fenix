import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTRPC} from '../../../utils/trpc';
import {Skeleton} from '../../../components/Skeleton';
import {DraftQuotationDialogTrigger} from './DraftQuotationDialogTrigger';
import {Button} from '../../../components/Button';
import {
  IconMapPinFilled,
  IconReceiptFilled,
  IconRefresh,
} from '@tabler/icons-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../../components/Empty';

export function QuotationsCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    data: quotations,
    refetch: refreshQuotations,
    isFetching,
  } = useQuery(trpc.jobs.quotations.queryOptions());
  const {mutate: approveQuotationMutationSync} = useMutation(
    trpc.jobs.approveQuotation.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.jobs.quotations.queryOptions());
      },
    }),
  );

  return (
    <div className='w-full rounded-3xl border border-(--divider) p-4'>
      <div className='flex items-center justify-between border-b border-b-(--divider) pb-2 mb-2'>
        <h3 className='text-lg font-bold text-primary'>Quotations</h3>
        <DraftQuotationDialogTrigger />
      </div>
      <ul>
        {isFetching &&
          Array(2)
            .fill('')
            .map((_, i) => (
              <li key={i} className='group/item'>
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
        {!isFetching && quotations?.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <IconReceiptFilled />
              </EmptyMedia>
              <EmptyTitle>No pending quotations</EmptyTitle>
              <EmptyDescription className='max-w-xs text-pretty'>
                You&apos;r all caught up. New quotations will appear here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type='button'
                variant='outline'
                onClick={() => refreshQuotations()}
              >
                <IconRefresh size={20} />
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        )}
        {quotations?.map(quote => (
          <li key={quote.id} className='group/item'>
            <div className='group-last/item:border-b-0 border-b border-b-(--divider) flex items-center justify-center py-3.5'>
              <div className='flex flex-col shrink grow min-w-0 space-y-0.75'>
                <div className='text-sm font-bold text-primary'>
                  {quote.customer.name}
                </div>
                <span className='text-xs text-secondary-foreground font-medium'>
                  {quote.title}
                </span>
                <div className='flex items-center space-x-1'>
                  <IconMapPinFilled
                    size={16}
                    className='text-secondary-foreground'
                  />
                  <span className='text-xs'>{quote.location}</span>
                </div>
                <span className='text-xs font-bold text-primary'>
                  {formatter.format(parseInt(quote.quoteAmount))}
                </span>
              </div>
              <div className='shrink-0 ml-4 flex items-center self-stretch space-x-1'>
                <Button
                  onClick={() =>
                    approveQuotationMutationSync({jobId: quote.id})
                  }
                >
                  Client accept
                </Button>
                <Button variant='secondary'>Reject</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const formatter = Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});
