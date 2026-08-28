import {createRouter} from '@tanstack/react-router';
import {routeTree} from './routeTree.gen';
import {QueryClientProvider} from '@tanstack/react-query';
import {getQueryClient} from './utils/getQueryClient';
import {useStable} from './hooks/useStable';
import {createTRPCClient, httpBatchLink} from '@trpc/client';
import {TRPCProvider, type AppRouter} from './utils/trpc';

export function getRouter() {
  const queryClient = getQueryClient();
  return createRouter({
    context: {queryClient},
    InnerWrap(props) {
      const trpcClient = useStable(() =>
        createTRPCClient<AppRouter>({
          links: [
            httpBatchLink({
              url: '/api/trpc',
              fetch: (input, init) =>
                fetch(input, {...init, credentials: 'include'}),
            }),
          ],
        }),
      );

      return (
        <QueryClientProvider client={queryClient}>
          <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
            {props.children}
          </TRPCProvider>
        </QueryClientProvider>
      );
    },
    routeTree,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
