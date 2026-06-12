import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import DashboardLayout from '../components/layout/DashboardLayout'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isPublicRoute = pathname.startsWith('/book/')

  if (isPublicRoute) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    )
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
