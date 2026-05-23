/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '@/lib/supabase/client'

export async function getDashboardData(
  month: string,
) {
  const { data, error } =
    await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        type,
        note,
        transaction_date,
        transfer_group_id,
        created_at,

        wallets:wallet_id (
          name
        ),

        categories:category_id (
          name
        )
      `)
      .or(
        'is_deleted.is.null,is_deleted.eq.false',
      )
      .order(
        'transaction_date',
        {
          ascending: false,
        },
      )
      .order('created_at', {
        ascending: false,
      })

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const transactions =
    data ?? []

  const filteredTransactions =
    transactions.filter(
      (transaction) => {
        const transactionMonth =
          transaction.transaction_date.slice(
            0,
            7,
          )

        return (
          transactionMonth ===
          month
        )
      },
    )

  const totalIncome =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type ===
            'income' &&
          !transaction.transfer_group_id,
      )
      .reduce(
        (
          total,
          transaction,
        ) =>
          total +
          Number(
            transaction.amount,
          ),
        0,
      )

  const totalExpense =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type ===
            'expense' &&
          !transaction.transfer_group_id,
      )
      .reduce(
        (
          total,
          transaction,
        ) =>
          total +
          Number(
            transaction.amount,
          ),
        0,
      )

  const expenseByCategory =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type ===
            'expense' &&
          !transaction.transfer_group_id,
      )
      .reduce(
        (
          acc,
          transaction,
        ) => {
          const categoryName =
            transaction
              .categories
              ?.name ||
            'Unknown'

          if (
            !acc[
              categoryName
            ]
          ) {
            acc[
              categoryName
            ] = 0
          }

          acc[
            categoryName
          ] += Number(
            transaction.amount,
          )

          return acc
        },
        {} as Record<
          string,
          number
        >,
      )

  const topExpenseCategories =
    Object.entries(
      expenseByCategory,
    )
      .sort(
        (a, b) =>
          b[1] - a[1],
      )
      .slice(0, 3)
      .map(
        ([name, total]) => ({
          name,
          total,
        }),
      )

  const groupedMap =
    new Map()

  filteredTransactions.forEach(
    (transaction: any) => {
      if (
        !transaction.transfer_group_id
      ) {
        groupedMap.set(
          transaction.id,
          transaction,
        )

        return
      }

      const existing =
        groupedMap.get(
          transaction.transfer_group_id,
        ) || {
          ...transaction,

          fromWallet: '',
          toWallet: '',
        }

      if (
        transaction.type ===
        'expense'
      ) {
        existing.fromWallet =
          transaction.wallets?.name
      }

      if (
        transaction.type ===
        'income'
      ) {
        existing.toWallet =
          transaction.wallets?.name
      }

      groupedMap.set(
        transaction.transfer_group_id,
        existing,
      )
    },
  )

  const groupedTransactions =
    Array.from(
      groupedMap.values(),
    )

  return {
    totalBalance:
      totalIncome -
      totalExpense,

    totalIncome,

    totalExpense,

    recentTransactions:
      groupedTransactions
        .filter(
          (
            transaction: any,
          ) =>
            !transaction.transfer_group_id ||
            (
              transaction.fromWallet &&
              transaction.toWallet
            ),
        )
        .slice(0, 3),

    topExpenseCategories,
  }
}