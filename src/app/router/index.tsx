import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { AppLayout } from '@/app/layouts/app-layout'

import { WalletsPage } from '@/features/wallets/pages/wallets-page'

import { TransactionsPage } from '@/features/transactions/pages/transactions-page'

import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'

import { CategoriesPage } from '@/features/categories/pages/categories-page'

import { SettingsPage } from '@/features/settings/pages/settings-page'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'wallets',
        element: <WalletsPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}