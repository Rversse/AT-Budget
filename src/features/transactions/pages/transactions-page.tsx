/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  KeyboardEvent,
} from 'react'

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useWallets } from '@/features/wallets/hooks/use-wallets'
import { useCategories } from '@/features/categories/hooks/use-categories'

import {
  createTransfer,
} from '@/services/transaction-service'

import { useTransactions } from '../hooks/use-transactions'
import { useCreateTransaction } from '../hooks/use-create-transaction'
import { useDeleteTransaction } from '../hooks/use-delete-transaction'
import { useUpdateTransaction } from '../hooks/use-update-transaction'

import { toast } from 'sonner'

import {
  getTodayLocalDate,
  normalizeDateInput,
} from '@/lib/date'

import {
  formatCurrency,
} from '@/lib/finance'

import {
  formatCurrencyInput,
  parseCurrencyInput,
} from '@/lib/currency-input'

import { SyncStatus } from '@/components/system/sync-status'

export function TransactionsPage() {
  const walletsQuery = useWallets()

  
const deleteTransactionMutation =
   useDeleteTransaction()

const updateTransactionMutation =
  useUpdateTransaction()

const createTransactionMutation =
  useCreateTransaction()

const queryClient =
  useQueryClient()

const [search, setSearch] =
  useState('')

const transferMutation =
  useMutation({
    mutationFn:
      createTransfer,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'transactions',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'wallets',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'dashboard',
          ],
        }),
      ])
    },
  })

  
const [type, setType] =
  useState<
    | 'income'
    | 'expense'
    | 'transfer'
    | null
  >(null)

  const [
    transactionDate,
    setTransactionDate,
  ] = useState(
    getTodayLocalDate(),
  )

  const [
  selectedMonth,
  setSelectedMonth,
] = useState(
  getTodayLocalDate().slice(
    0,
    7,
  ),
)

  const transactionsQuery =
  useTransactions(
    selectedMonth,
  )

  const [
  transactionFilter,
  setTransactionFilter,
] = useState<
  | 'all'
  | 'income'
  | 'expense'
  | 'transfer'
>('all')

  const [amount, setAmount] =
    useState('')

  const [note, setNote] =
    useState('')

  const [walletId, setWalletId] =
    useState('')

  const [toWalletId, setToWalletId] =
    useState('')

  const [categoryId, setCategoryId] =
    useState('')

  const [
    editingTransactionId,
    setEditingTransactionId,
  ] = useState<
    string | null
  >(null)

  const [editingAmount, setEditingAmount] =
    useState('')

  const editInputRef =
    useRef<HTMLInputElement>(null)

  const amountInputRef =
  useRef<HTMLInputElement>(null)

  const [
  isFormOpen,
  setIsFormOpen,
] = useState(false)

  const [
    deletingTransactionId,
    setDeletingTransactionId,
  ] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (
      editingTransactionId &&
      editInputRef.current
    ) {
      editInputRef.current.focus()

      editInputRef.current.select()
    }
  }, [editingTransactionId])

const categoriesQuery =
  useCategories(
    type === 'transfer'
      ? 'expense'
      : type ??
          'expense',
  )

    if (transactionsQuery.isLoading) {
  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-32">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />

        <div className="h-4 w-64 animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />

      <div className="space-y-3">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-zinc-200"
            />
          ),
        )}
      </div>
    </div>
  )
}

if (transactionsQuery.isError) {
  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="text-4xl">
            ⚠️
          </div>

          <p className="mt-4 text-base font-medium">
            Failed to load transactions
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Please try again later
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

  const wallets =
    (walletsQuery.data ??
      []) as any[]

  const categories =
    (categoriesQuery.data ??
      []) as any[]

  const rawTransactions =
    (transactionsQuery.data ??
      []) as any[]

  function handleEditKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    transaction: any,
  ) {
    if (e.key === 'Enter') {
      e.preventDefault()

      handleEdit(transaction)
    }

    if (e.key === 'Escape') {
      setEditingTransactionId(
        null,
      )

      setEditingAmount('')
    }
  }

  async function handleSubmit(
    e?: React.FormEvent,
  ) {
    e?.preventDefault()

    if (
      createTransactionMutation.isPending ||
      transferMutation.isPending
    ) {
      return
    }

    try {
      if (!navigator.onLine) {
  toast.error(
    'No internet connection',
  )

  return
}

      if (!walletId) {
        toast.error('Select wallet')

        return
      }

        const parsedAmount =
          parseCurrencyInput(
            amount,
          )

      if (
        Number.isNaN(parsedAmount) ||
        parsedAmount <= 0
      ) {
        toast.error('Invalid amount')

        return
      }

      if (type === 'transfer') {
        if (!toWalletId) {
          toast.error(
            'Select destination wallet',
          )

          return
        }

        await transferMutation.mutateAsync(
          {
            fromWalletId:
              walletId,

            toWalletId,

            amount:
              parsedAmount,

            note:
              note.trim(),

            transactionDate:
              normalizeDateInput(
                transactionDate,
              ),
          },
        )

        toast.success(
          'Transfer completed',
        )

        setAmount('')
        setNote('')
        setCategoryId('')
        setToWalletId('')

        setTransactionDate(
          getTodayLocalDate(),
        )

        amountInputRef.current?.focus()

        return
      }

if (!categoryId) {
  toast.error(
    'Select category',
  )

  return
}

if (!type) {
  toast.error(
    'Select transaction type',
  )

  return
}

      await createTransactionMutation.mutateAsync(
        {
          type,

          walletId,

          categoryId,

          amount:
            parsedAmount,

          note:
            note.trim(),

          transactionDate:
            normalizeDateInput(
              transactionDate,
            ),
        },
      )

      toast.success(
        'Transaction created',
      )
      setAmount('')
      setNote('')

      setTransactionDate(
        getTodayLocalDate(),
      )
      
      amountInputRef.current?.focus()

    } catch (error) {
  if (
    !(error instanceof Error) ||
    error.message !==
      'Insufficient balance'
  ) {
    console.error(error)
  }

      if (
        error instanceof Error
      ) {
        toast.error(
          error.message,
        )
      } else {
        toast.error(
          'Failed to create transaction',
        )
      }
    }
  }

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteTransactionMutation.mutateAsync(
        id,
      )

      setDeletingTransactionId(
        null,
      )
    } catch (error) {
      console.error(error)

      toast.error(
        'Failed to delete transaction',
      )
    }
  }

  async function handleEdit(
  transaction: any,
) {
const amount =
  parseCurrencyInput(
    editingAmount,
  )

  if (
    Number.isNaN(amount) ||
    amount <= 0
  ) {
    toast.error(
      'Invalid amount',
    )

    return
  }

  const currentWallet =
    wallets.find(
      (wallet: any) =>
        wallet.id ===
        transaction.wallet_id,
    )

  if (
    transaction.type ===
      'expense' &&
    amount >
      Number(
        transaction.amount,
      )
  ) {
    const additionalRequired =
      amount -
      Number(
        transaction.amount,
      )

    if (
      currentWallet &&
      currentWallet.balance <
        additionalRequired
    ) {
      toast.error(
        'Insufficient balance',
      )

      return
    }
  }

  try {
    await updateTransactionMutation.mutateAsync(
      {
        id: transaction.id,

        walletId:
          transaction.wallet_id,

        categoryId:
          transaction.category_id,

        amount,

        note:
          transaction.note,
      },
    )

    setEditingTransactionId(
      null,
    )

    setEditingAmount('')

    toast.success(
      'Transaction updated',
    )
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !==
        'Insufficient balance'
    ) {
      console.error(error)
    }

    if (
      error instanceof Error
    ) {
      toast.error(
        error.message,
      )
    } else {
      toast.error(
        'Failed to update transaction',
      )
    }
  }
  }

const filteredTransactions =
  rawTransactions.filter(
    (transaction: any) => {
      const query =
        search
          .trim()
          .toLowerCase()

      const matchesSearch =
        !query ||
        transaction.note
          ?.toLowerCase()
          .includes(query) ||
        transaction.categories?.name
          ?.toLowerCase()
          .includes(query) ||
        transaction.wallets?.name
          ?.toLowerCase()
          .includes(query)

      const isTransfer =
        Boolean(
          transaction.transfer_group_id,
        )

      const matchesType =
        transactionFilter ===
        'all'
          ? true
          : transactionFilter ===
              'transfer'
            ? isTransfer
            : !isTransfer &&
              transaction.type ===
                transactionFilter

      return (
        matchesSearch &&
        matchesType
      )
    },
  )

const allProcessedTransactions =
  filteredTransactions.reduce(
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

const processedTransactions =
  allProcessedTransactions

  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-40">
<div className="sticky top-0 z-10 -mx-4 border-b bg-zinc-50/95 px-4 pb-4 pt-1 backdrop-blur">
  <h1 className="text-2xl font-bold tracking-tight">
    Transactions
  </h1>

  <p className="mt-1 text-sm text-muted-foreground">
    Quick personal finance logging
  </p>
  <div className="mt-2">
  <SyncStatus />
</div>
</div>

<div className="flex gap-2 overflow-x-auto pb-1">
  <button
    type="button"
    className={
      selectedMonth ===
      getTodayLocalDate().slice(
        0,
        7,
      )
        ? 'rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white'
        : 'rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium'
    }
    onClick={() =>
      setSelectedMonth(
        getTodayLocalDate().slice(
          0,
          7,
        ),
      )
    }
  >
    This Month
  </button>

  <button
    type="button"
    className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium"
    onClick={() => {
      const date =
        new Date()

      date.setMonth(
        date.getMonth() - 1,
      )

      setSelectedMonth(
        `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, '0')}`,
      )
    }}
  >
    Last Month
  </button>

  <input
    type="month"
    className="rounded-full border bg-white px-3 py-1 text-xs"
    value={selectedMonth}
    onChange={(e) =>
      setSelectedMonth(
        e.target.value,
      )
    }
  />
</div>

<Input
  placeholder="Search transactions..."
  className="h-11 rounded-xl border bg-white shadow-sm"
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
/>

<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
  Filter
</p>

<div className="flex justify-center gap-2 overflow-x-auto pb-1">
  {[
    'all',
    'income',
    'expense',
    'transfer',
  ].map((filter) => (
    <button
      key={filter}
      type="button"
      onClick={() =>
        setTransactionFilter(
          filter as
            | 'all'
            | 'income'
            | 'expense'
            | 'transfer',
        )
      }
className={[
  'rounded-full px-4 py-2 text-sm font-medium capitalize transition',

  transactionFilter ===
  filter
    ? filter === 'income'
      ? 'bg-green-600 text-white'
      : filter ===
            'expense'
        ? 'bg-red-600 text-white'
        : filter ===
              'transfer'
          ? 'bg-blue-600 text-white'
          : 'bg-black text-white'
    : 'bg-zinc-200 text-zinc-700',
].join(' ')}
    >
      {filter}
    </button>
  ))}
</div>

<button
  type="button"
  className="w-full rounded-2xl border bg-white px-4 py-4 text-sm font-semibold shadow-sm transition active:scale-[0.99]"
  onClick={() => {
    setIsFormOpen(
      !isFormOpen,
    )

    if (!isFormOpen) {
      setTimeout(() => {
        amountInputRef.current?.focus()
      }, 150)
    }
  }}
>
  {isFormOpen
    ? 'Close Transaction Form'
    : '+ Add Transaction'}
</button>

{isFormOpen && (
<button
  type="button"
  className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition active:scale-95"
  onClick={() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    setTimeout(() => {
      amountInputRef.current?.focus()
    }, 250)
  }}
>
  +
</button>
)}

{isFormOpen && (
<form
  onSubmit={(e) => {
    e.preventDefault()
    handleSubmit()
  }}
>
  <Card className="border-0 bg-zinc-50/95 shadow-sm backdrop-blur">
    <CardContent className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-2">

           <Button
              type="button"
              className={
type === 'income'
  ? 'border border-green-200 bg-green-50 text-green-600! shadow-sm'
  : 'bg-zinc-100 text-zinc-700'
              }
onClick={() => {
  setType('income')
  setCategoryId('')
  setToWalletId('')
}}
            >
              Income
            </Button>

            <Button
              type="button"
              className={
type === 'expense'
  ? 'border border-red-200 bg-red-50 text-red-600! shadow-sm'
  : 'bg-zinc-100 text-zinc-700'
              }
onClick={() => {
  setType('expense')
  setCategoryId('')
  setToWalletId('')
}}
            >
              Expense
            </Button>

            <Button
              type="button"
              className={
type === 'transfer'
  ? 'border border-blue-200 bg-blue-50 text-blue-600! shadow-sm'
  : 'bg-zinc-100 text-zinc-700'
              }
onClick={() => {
  setType('transfer')
  setCategoryId('')
}}
            >
              Transfer
            </Button>
          </div>

<input
  ref={amountInputRef}
  type="text"
  inputMode="numeric"
  placeholder="Amount"
  className="flex h-14 w-full rounded-xl border border-input bg-background px-4 text-center text-xl font-semibold shadow-sm"
  value={amount}
onChange={(e) => {
  const formatted =
    formatCurrencyInput(
      e.target.value,
    )

  if (
    formatted.length > 16
  ) {
    return
  }

  setAmount(formatted)
}}
/>

<div className="flex flex-wrap justify-center gap-2 pt-1">
  {[
    20000,
    50000,
    100000,
  ].map((preset) => (
    <button
      key={preset}
      type="button"
      className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition active:scale-95"
onClick={() => {
  setAmount(
    String(preset),
  )

  amountInputRef.current?.focus()
}}
    >
      {preset >= 1000
  ? `${preset / 1000}K`
  : preset}
    </button>
  ))}
</div>

          <Input
            placeholder="Optional note"
            className="h-12 rounded-xl border bg-white shadow-sm"
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
          />

          <Input
            type="date"
            className="h-12 rounded-xl border bg-white shadow-sm"
            max={getTodayLocalDate()}
            value={transactionDate}
            onChange={(e) =>
              setTransactionDate(
                e.target.value,
              )
            }
          />

          <select
            className="h-12 w-full rounded-xl border bg-white px-3 text-sm shadow-sm"
            value={walletId}
onChange={(e) => {
  setWalletId(e.target.value)

  if (
    e.target.value ===
    toWalletId
  ) {
    setToWalletId('')
  }
}}
          >
            <option value="">
              Select wallet
            </option>

            {wallets.map(
              (wallet: any) => (
                <option
                  key={wallet.id}
                  value={wallet.id}
                >
                  {wallet.name}
                </option>
              ),
            )}
          </select>

{walletId && (
  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <p className="text-xs text-muted-foreground">
      Current Balance
    </p>

    <p className="mt-1 text-xl font-bold">
      {formatCurrency(
        Number(
          wallets.find(
            (wallet: any) =>
              wallet.id ===
              walletId,
          )?.balance ?? 0,
        ),
      )}
    </p>
  </div>
)}

          {type === 'transfer' && (
            <select
              className="h-12 w-full rounded-xl border bg-white px-3 text-sm shadow-sm"
              value={toWalletId}
onChange={(e) => {
  if (
    e.target.value ===
    walletId
  ) {
    return
  }

  setToWalletId(
    e.target.value,
  )
}}
            >
              <option value="">
                Destination wallet
              </option>

              {wallets.map(
                (wallet: any) => (
<option
  key={wallet.id}
  value={wallet.id}
  disabled={
    wallet.id === walletId
  }
>
  {wallet.name}
</option>
                ),
              )}
            </select>
          )}

          {type !== 'transfer' && (
            <select
              className="h-12 w-full rounded-xl border bg-white px-3 text-sm shadow-sm"
              value={categoryId}
              onChange={(e) =>
                setCategoryId(
                  e.target.value,
                )
              }
            >
              <option value="">
                Select category
              </option>

              {categories
  .filter((category: any) => {
    const normalizedName =
      category.name
        ?.trim()
        ?.toLowerCase()

    return (
      normalizedName !==
        'transfer in' &&
      normalizedName !==
        'transfer out'
    )
  })
  .map(
    (category: any) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>
          )}

<Button
  type="submit"
  className="h-12 w-full rounded-xl text-base font-semibold shadow-sm transition active:scale-[0.99]"
disabled={
  createTransactionMutation.isPending ||
  transferMutation.isPending ||
  !amount ||
  !walletId ||
  (
    type !==
      'transfer' &&
    !categoryId
  ) ||
  (
    type ===
      'transfer' &&
    (
      !toWalletId ||
      walletId ===
        toWalletId
    )
  )
}
>
  {createTransactionMutation.isPending ||
  transferMutation.isPending
    ? 'Saving...'
    : type === 'income'
      ? 'Add Income'
      : type === 'transfer'
        ? 'Transfer'
        : 'Add Expense'}
</Button>
        </CardContent>
      </Card>
      </form>
)}
      <div className="space-y-4">
{processedTransactions.length === 0 && (
  <Card className="border-0 shadow-sm">
    <CardContent className="flex flex-col items-center justify-center p-10 text-center">
      <div className="text-4xl">
        {search ||
        transactionFilter !==
          'all'
          ? '🔍'
          : '💸'}
      </div>

      <p className="mt-4 text-base font-medium">
        {search ||
        transactionFilter !==
          'all'
          ? 'No matching transactions'
          : 'No transactions yet'}
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        {search ||
        transactionFilter !==
          'all'
          ? 'Try changing your filters or search keyword'
          : 'Add your first transaction to start tracking'}
      </p>
    </CardContent>
  </Card>
)}
        {processedTransactions.map(
          (transaction: any) => (
<Card
  key={transaction.id}
  className="border-0 shadow-sm transition active:scale-[0.99]"
>
  <CardContent className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
<div className="flex items-center gap-2">
  <p className="truncate text-[15px] font-semibold">
    {transaction.transfer_group_id
      ? 'Wallet Transfer'
      : transaction
          .categories?.name}
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
        </div>

        {transaction.note && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {transaction.note}
          </p>
        )}

{transaction.transfer_group_id ? (
  <div className="mt-2 flex items-center gap-2 text-xs">
    <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-600">
      {transaction.fromWallet}
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
        wallets.find(
          (wallet: any) =>
            wallet.id ===
            transaction.wallet_id,
        )?.color ??
        '#000',
    }}
  />

  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
    {
      transaction.wallets
        ?.name
    }
  </p>
</div>
)}

<div className="mt-2 flex items-center gap-3">
  {!transaction.transfer_group_id && (
    editingTransactionId ===
    transaction.id ? (
      <div className="flex items-center gap-2">
        <input
          ref={editInputRef}
          type="text"
          inputMode="numeric"
          className="w-24 rounded border px-2 py-1 text-xs"
          value={editingAmount}
          onKeyDown={(e) =>
            handleEditKeyDown(
              e,
              transaction,
            )
          }
          onChange={(e) => {
const formatted =
  formatCurrencyInput(
    e.target.value,
  )

if (
  formatted.length > 16
) {
  return
}

setEditingAmount(
  formatted,
)
          }}
        />

        <button
          type="button"
          className="text-xs font-medium text-muted-foreground transition hover:text-green-600"
          onClick={() =>
            handleEdit(
              transaction,
            )
          }
        >
          Save
        </button>

        <button
          type="button"
          className="text-xs text-muted-foreground transition hover:text-black"
          onClick={() => {
            setEditingTransactionId(
              null,
            )

            setEditingAmount('')
          }}
        >
          Cancel
        </button>
      </div>
    ) : (
      <button
        type="button"
        className="text-xs text-muted-foreground transition hover:text-blue-500"
        onClick={() => {
          setDeletingTransactionId(
            null,
          )

          setEditingTransactionId(
            transaction.id,
          )

          setEditingAmount(
            String(
              transaction.amount,
            ),
          )
        }}
      >
        Edit
      </button>
    )
  )}

  {editingTransactionId !==
    transaction.id &&
    (deletingTransactionId ===
    transaction.id ? (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xs font-medium text-red-500 transition hover:text-red-600"
          onClick={() =>
            handleDelete(
              transaction.id,
            )
          }
        >
          Confirm
        </button>

        <button
          type="button"
          className="text-xs text-muted-foreground transition hover:text-black"
          onClick={() =>
            setDeletingTransactionId(
              null,
            )
          }
        >
          Cancel
        </button>
      </div>
    ) : (
      <button
        type="button"
        className="text-xs text-muted-foreground transition hover:text-red-500"
        onClick={() => {
          setEditingTransactionId(
            null,
          )

          setDeletingTransactionId(
            transaction.id,
          )
        }}
      >
        Delete
      </button>
    ))}
</div>
      </div>

      <div className="text-right">
        <p
className={
  transaction.transfer_group_id
    ? 'font-semibold text-blue-600'
    : transaction.type ===
        'income'
      ? 'text-lg font-bold text-green-600'
      : 'text-lg font-bold text-red-600'
}
        >
{transaction.transfer_group_id
  ? '⇅ '
  : transaction.type ===
      'income'
    ? '+ '
    : '- '}
{formatCurrency(
  Number(
    transaction.amount,
  ),
)}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
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
    </div>
  </CardContent>
</Card>
          ),
        )}
      </div>
    </div>
  )
}