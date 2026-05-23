/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import { useDashboard } from '../hooks/use-dashboard'

import {
  formatCompactCurrency, formatCurrency
} from '@/lib/finance'

export function DashboardPage() {

  const [month, setMonth] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 7),
    )

  const dashboardQuery =
    useDashboard(month)

  const dashboard =
    dashboardQuery.data

if (dashboardQuery.isLoading) {
  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-40">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />

        <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="h-12 animate-pulse rounded-xl bg-zinc-200" />

      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />

          <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-zinc-200"
            />
          ),
        )}
      </div>
    </div>
  )
}

if (!dashboard) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="text-4xl">
            ⚠️
          </div>

          <p className="mt-4 text-base font-medium">
            Failed to load dashboard
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Please check your connection and try again
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

if (
  dashboard.totalBalance ===
    0 &&
  dashboard.totalIncome ===
    0 &&
  dashboard.totalExpense ===
    0
) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="text-4xl">
            📊
          </div>

          <p className="mt-4 text-base font-medium">
            No financial activity yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Add your first transaction to start tracking your finances
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
    
const processedTransactions = (
  dashboard.recentTransactions ??
  []
)
  .reduce(
    (
      acc: any[],
      transaction: any,
    ) => {
      if (
        !transaction.transfer_group_id
      ) {
        acc.push(transaction)

        return acc
      }

      const existingTransfer =
        acc.find(
          (item) =>
            item.transfer_group_id ===
            transaction.transfer_group_id,
        )

      if (existingTransfer) {
        if (
          transaction.type ===
          'income'
        ) {
          existingTransfer.toWallet =
            transaction.wallets?.name
        }

        if (
          transaction.type ===
          'expense'
        ) {
          existingTransfer.fromWallet =
            transaction.wallets?.name
        }

        return acc
      }

      acc.push({
        ...transaction,

        fromWallet:
          transaction.type ===
          'expense'
            ? transaction.wallets
                ?.name
            : '',

        toWallet:
          transaction.type ===
          'income'
            ? transaction.wallets
                ?.name
            : '',
      })

      return acc
    },
    [],
  )
  .slice(0, 3)
  
    return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-40">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Family finance overview
        </p>
      </div>

      <input
        type="month"
        className="h-12 w-full rounded-xl border bg-white px-3 text-sm shadow-sm"
        value={month}
        onChange={(e) =>
          setMonth(
            e.target.value,
          )
        }
      />

      <div className="space-y-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Total Balance
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Rp{' '}
              {Number(
                dashboard.totalBalance,
              ).toLocaleString(
                'id-ID',
              )}
            </h2>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">
                Income
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-green-600">
{formatCompactCurrency(
  Number(
    dashboard.totalIncome,
  ),
)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">
                Expense
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-red-600">
{formatCompactCurrency(
  Number(
    dashboard.totalExpense,
  ),
)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
  <CardContent className="p-5">
<div className="flex items-center justify-center">
  <div className="text-center">
    <p className="text-base font-bold text-muted-foreground">
      TOP SPENDING
    </p>

    {/* 
    <h2 className="mt-1 text-lg font-semibold">
      Categories
    </h2> 
    */}
  </div>
</div>

    <div className="mt-5 space-y-2">
      {dashboard.topExpenseCategories
  .length ===
      0 ? (
        <p className="text-sm text-muted-foreground">
          No spending data yet
        </p>
      ) : (
        dashboard.topExpenseCategories.map(
          (category) => (
            <div
              key={category.name}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {
                    category.name
                  }
                </p>

{/* 
<p className="text-xs text-muted-foreground">
  Top expense category
</p> 
*/}
              </div>

              <p className="text-sm font-semibold">
                {formatCurrency(
                  category.total,
                )}
              </p>
            </div>
          ),
        )
      )}
    </div>
  </CardContent>
</Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Recent Transactions
          </h2>

          <p className="text-xs text-muted-foreground">
            Last 3
          </p>
        </div>

        {processedTransactions.length ===
          0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <p className="text-base font-medium">
                No transactions this month
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add transactions to see activity
              </p>
            </CardContent>
          </Card>
        )}

        {processedTransactions.map(
          (
            transaction: any,
          ) => (
            <Card
              key={
                transaction.transfer_group_id ||
                transaction.id
              }
              className="border-0 shadow-sm transition active:scale-[0.99]"
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold">
                      {transaction.transfer_group_id
                        ? 'Wallet Transfer'
                        : transaction
                            .categories
                            ?.name}
                    </p>

                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-[10px] font-semibold',

                        transaction.transfer_group_id
                          ? 'bg-blue-100 text-blue-700'
                          : transaction.type ===
                              'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700',
                      ].join(' ')}
                    >
                      {transaction.transfer_group_id
                        ? 'transfer'
                        : transaction.type}
                    </span>
                  </div>

                  {transaction.transfer_group_id ? (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-600">
                        {
                          transaction.fromWallet
                        }
                      </span>

                      <span className="text-muted-foreground">
                        →
                      </span>

                      <span className="rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-700">
                        {transaction.toWallet}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            '#000',
                        }}
                      />

                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {
                          transaction
                            .wallets
                            ?.name
                        }
                      </p>
                    </div>
                  )}

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(
                      transaction.transaction_date,
                    ).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    )}
                  </p>
                </div>

                <p
                  className={
                    transaction.transfer_group_id
                      ? 'text-lg font-bold text-blue-600'
                      : transaction.type ===
                          'income'
                        ? 'text-lg font-bold text-green-600'
                        : 'text-lg font-bold text-red-600'
                  }
                >
                  {transaction.transfer_group_id
                    ? '⇅'
                    : transaction.type ===
                        'income'
                      ? '+'
                      : '-'}{' '}
                  Rp{' '}
                  {Number(
                    transaction.amount,
                  ).toLocaleString(
                    'id-ID',
                  )}
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  )
}