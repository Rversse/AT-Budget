import { useState } from 'react'

import {
  useMutation,
} from '@tanstack/react-query'

import { toast } from 'sonner'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import {
  resetAllData,
} from '@/services/reset-service'

import {
  getSavedPin,
} from '@/lib/security/pin'

import {
  exportTransactions,
} from '@/lib/export/export-transactions'

import {
  useTransactions,
} from '@/features/transactions/hooks/use-transactions'

export function SettingsPage() {
  const [
    exportMonth,
    setExportMonth,
  ] = useState(
    new Date()
      .toISOString()
      .slice(0, 7),
  )

  const transactionsQuery =
    useTransactions()

  const resetMutation =
    useMutation({
      mutationFn:
        resetAllData,

      onSuccess:
        async () => {
          localStorage.removeItem(
            'REACT_QUERY_OFFLINE_CACHE',
          )

          sessionStorage.clear()

          window.location.href =
            '/'
        },

      onError: (
        error,
      ) => {
        if (
          error instanceof
          Error
        ) {
          toast.error(
            error.message,
          )
        } else {
          toast.error(
            'Failed to reset data',
          )
        }
      },
    })

  const filteredTransactions =
    (
      transactionsQuery.data ??
      []
    ).filter(
      (transaction) =>
        transaction.transaction_date.slice(
          0,
          7,
        ) === exportMonth,
    )

  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-32">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your app preferences
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                APP
              </p>

              <p className="mt-1 text-base font-semibold">
                AT Budget
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                VERSION
              </p>

              <p className="mt-1 text-base">
                v1.0.0
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                OFFLINE SUPPORT
              </p>

              <p className="mt-1 text-base">
                Enabled
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-medium text-muted-foreground">
              SECURITY
            </p>

            <button
              className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
              onClick={() => {
                window.dispatchEvent(
                  new Event(
                    'lock-app',
                  ),
                )
              }}
            >
              Lock App
            </button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-medium text-muted-foreground">
              EXPORT
            </p>

            <input
              type="month"
              className="h-12 w-full rounded-xl border bg-white px-3 text-sm shadow-sm"
              value={
                exportMonth
              }
              onChange={(e) =>
                setExportMonth(
                  e.target.value,
                )
              }
            />

            <button
              className="w-full rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-zinc-100 active:scale-[0.99]"
              onClick={() => {
                exportTransactions(
                  filteredTransactions,
                  exportMonth,
                )

                toast.success(
                  'Transactions exported',
                )
              }}
            >
              Export Transactions CSV
            </button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-medium text-red-500">
              DANGER ZONE
            </p>

            <button
              className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 active:scale-[0.99]"
              onClick={() => {
                const confirmed =
                  confirm(
                    'Reset all data permanently?',
                  )

                if (
                  !confirmed
                ) {
                  return
                }

                const pin =
                  prompt(
                    'Enter PIN to continue',
                  )

                if (!pin) {
                  return
                }

                const savedPin =
                  getSavedPin()

                if (
                  pin !==
                  savedPin
                ) {
                  toast.error(
                    'Wrong PIN',
                  )

                  return
                }

                resetMutation.mutate()
              }}
            >
              Reset All Data
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}