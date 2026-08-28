import * as React from 'react'
import { Outlet, createRootRoute, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRouteWrapper,
})

function RootRouteWrapper() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}
