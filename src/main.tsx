import React from 'react'

import ReactDOM from 'react-dom/client'

import './index.css'

import { OfflineBanner } from '@/components/offline-banner'

import { QueryProvider } from '@/app/providers/query-provider'

import { AppRouter } from '@/app/router'

import { Toaster } from '@/components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
<QueryProvider>
  <OfflineBanner />

  <AppRouter />

  <Toaster />
</QueryProvider>
  </React.StrictMode>,
)