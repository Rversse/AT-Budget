import { supabase } from '@/lib/supabase/client'

import { getWalletBalance } from './wallet-service'
import { assertOnline } from '@/lib/utils/assert-online'

type CreateTransactionInput = {
  type: 'income' | 'expense'

  walletId: string

  categoryId: string

  amount: number

  note?: string

  transactionDate: string
}

type CreateTransferInput = {
  fromWalletId: string

  toWalletId: string

  amount: number

  note?: string

  transactionDate: string
}

type UpdateTransactionInput = {
  id: string

  categoryId: string

  walletId: string

  amount: number

  note?: string
}

function validateAmount(
  amount: number,
) {
  if (!Number.isFinite(amount)) {
    throw new Error(
      'Invalid amount',
    )
  }

  if (amount <= 0) {
    throw new Error(
      'Amount must be greater than zero',
    )
  }

  if (amount > 999999999999) {
    throw new Error(
      'Amount too large',
    )
  }
}

export async function createTransaction(
  input: CreateTransactionInput,
) {
  assertOnline()
  validateAmount(input.amount)

  if (!input.walletId) {
    throw new Error(
      'Wallet required',
    )
  }

  if (!input.categoryId) {
    throw new Error(
      'Category required',
    )
  }

  if (input.type === 'expense') {
    const balance =
      await getWalletBalance(
        input.walletId,
      )

    if (balance < input.amount) {
      throw new Error(
        'Insufficient balance',
      )
    }
  }

  const { error } = await supabase
    .from('transactions')
    .insert({
      type: input.type,

      wallet_id: input.walletId,

      category_id: input.categoryId,

      amount: input.amount,

      note:
  input.note?.trim() ||
  null,

      transaction_date:
        input.transactionDate,
    })

  if (error) {
    throw new Error(error.message)
  }
}

export async function createTransfer(
  input: CreateTransferInput,
) {
  validateAmount(input.amount)

  if (!input.fromWalletId) {
    throw new Error(
      'Source wallet required',
    )
  }

  if (!input.toWalletId) {
    throw new Error(
      'Destination wallet required',
    )
  }

  if (
    input.fromWalletId ===
    input.toWalletId
  ) {
    throw new Error(
      'Wallet cannot be same',
    )
  }

  const balance =
    await getWalletBalance(
      input.fromWalletId,
    )

  if (balance < input.amount) {
    throw new Error(
      'Insufficient balance',
    )
  }

  const transferGroupId =
    crypto.randomUUID()

  const {
    data,
    error: categoriesError,
  } = await supabase
    .from('categories')
    .select('id, name')

  if (categoriesError) {
    throw new Error(
      categoriesError.message,
    )
  }

  const categories = data ?? []

  const transferOutCategory =
    categories.find(
      (category: {
        id: string
        name: string
      }) =>
        category.name
          ?.trim()
          .toLowerCase() ===
        'transfer out',
    )

  const transferInCategory =
    categories.find(
      (category: {
        id: string
        name: string
      }) =>
        category.name
          ?.trim()
          .toLowerCase() ===
        'transfer in',
    )

  let resolvedTransferOutCategory =
    transferOutCategory

  let resolvedTransferInCategory =
    transferInCategory

  if (
    !resolvedTransferOutCategory
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('categories')
      .insert({
        name: 'Transfer Out',
        type: 'expense',
      })
      .select()
      .single()

    if (error) {
      throw new Error(
        error.message,
      )
    }

    resolvedTransferOutCategory =
      data
  }

  if (
    !resolvedTransferInCategory
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('categories')
      .insert({
        name: 'Transfer In',
        type: 'income',
      })
      .select()
      .single()

    if (error) {
      throw new Error(
        error.message,
      )
    }

    resolvedTransferInCategory =
      data
  }

  const { error } =
    await supabase
      .from('transactions')
      .insert([
        {
          type: 'expense',

          wallet_id:
            input.fromWalletId,

          category_id:
            resolvedTransferOutCategory.id,

          amount:
            input.amount,

          note:
            input.note?.trim() ||
            null,

          transaction_date:
            input.transactionDate,

          transfer_group_id:
            transferGroupId,
        },

        {
          type: 'income',

          wallet_id:
            input.toWalletId,

          category_id:
            resolvedTransferInCategory.id,

          amount:
            input.amount,

          note:
            input.note?.trim() ||
            null,

          transaction_date:
            input.transactionDate,

          transfer_group_id:
            transferGroupId,
        },
      ])

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function getTransactions(
  month?: string,
) {
  let query = supabase
    .from('transactions')
    .select(`
      id,
      amount,
      note,
      type,
      wallet_id,
      category_id,
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

  if (month) {
    const startDate =
      `${month}-01`

    const endDate =
      new Date(startDate)

    endDate.setMonth(
      endDate.getMonth() + 1,
    )

    const formattedEndDate =
      `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1,
      ).padStart(2, '0')}-01`

    query = query
      .gte(
        'transaction_date',
        startDate,
      )
      .lt(
        'transaction_date',
        formattedEndDate,
      )
  }

  const { data, error } =
    await query.order(
      'transaction_date',
      {
        ascending: false,
      },
    )
      .order('created_at', {
        ascending: false,
      })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function deleteTransaction(
  id: string,
) {
  const { data: transaction, error } =
    await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        type,
        wallet_id,
        is_deleted
      `)
      .eq('id', id)
      .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!transaction) {
    throw new Error(
      'Transaction not found',
    )
  }

  if (transaction.is_deleted) {
    return
  }

  if (
    transaction.type ===
    'income'
  ) {
    const currentBalance =
      await getWalletBalance(
        transaction.wallet_id,
      )

    const nextBalance =
      currentBalance -
      Number(
        transaction.amount,
      )

    if (nextBalance < 0) {
      throw new Error(
        'Cannot delete income that is already used',
      )
    }
  }

  const { error: updateError } =
    await supabase
      .from('transactions')
      .update({
        is_deleted: true,
      })
      .eq('id', id)

  if (updateError) {
    throw new Error(
      updateError.message,
    )
  }
}

export async function updateTransaction(
  input: UpdateTransactionInput,
) {
  validateAmount(input.amount)

  if (!input.walletId) {
    throw new Error(
      'Wallet required',
    )
  }

  if (!input.categoryId) {
    throw new Error(
      'Category required',
    )
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      category_id:
        input.categoryId,

      wallet_id:
        input.walletId,

      amount: input.amount,

      note:
  input.note?.trim() ||
  null,
    })
    .eq('id', input.id)

  if (error) {
    throw new Error(error.message)
  }
}