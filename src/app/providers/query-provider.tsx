import { useState } from 'react'
import type { PropsWithChildren } from 'react'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import {
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client'

import {
  createSyncStoragePersister,
} from '@tanstack/query-sync-storage-persister'

const persister =
  createSyncStoragePersister({
    storage: window.localStorage,
  })

export function QueryProvider({
  children,
}: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,

            retry: 1,

            staleTime:
              1000 * 60 * 5,
          },
        },
      }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
      }}
    >
      <QueryClientProvider
        client={queryClient}
      >
        {children}

        <ReactQueryDevtools
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </PersistQueryClientProvider>
  )
}