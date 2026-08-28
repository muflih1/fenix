import {QueryClient} from '@tanstack/react-query';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let _queryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (!_queryClient) _queryClient = createQueryClient();
  return _queryClient;
}
