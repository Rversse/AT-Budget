import { supabase } from '@/lib/supabase/client'

import {
  calculateBalance,
} from '@/lib/finance'
import { assertOnline } from '@/lib/utils/assert-online'




type CreateWalletInput = {
  name: string

  color?: string
}

export async function createWallet(
  input: CreateWalletInput,
) {
  assertOnline()
  const normalizedName =
    input.name
      .trim()
      .toLowerCase()

  const {
    data: existingWallets,
    error: existingError,
  } = await supabase
    .from('wallets')
    .select(
      'id,name,is_archived',
    )

  if (existingError) {
    throw new Error(
      existingError.message,
    )
  }

  const activeWallet =
    existingWallets?.find(
      (wallet) =>
        wallet.name
          ?.trim()
          ?.toLowerCase() ===
          normalizedName &&
        !wallet.is_archived,
    )

  if (activeWallet) {
    throw new Error(
      'Wallet already exists',
    )
  }

  const archivedWallet =
    existingWallets?.find(
      (wallet) =>
        wallet.name
          ?.trim()
          ?.toLowerCase() ===
          normalizedName &&
        wallet.is_archived,
    )

  if (archivedWallet) {
    const { error } =
      await supabase
        .from('wallets')
        .update({
          is_archived: false,
        })
        .eq(
          'id',
          archivedWallet.id,
        )

    if (error) {
      throw new Error(
        error.message,
      )
    }

    return
  }

  const { error } = await supabase
    .from('wallets')
    .insert({
      name:
        input.name.trim(),

      color:
        input.color ||
        '#000000',
    })

  if (error) {
    throw new Error(error.message)
  }
}

export async function getWallets() {
  const { data, error } = await supabase
    .from('wallets')
    .select(`
      id,
      name,
      color,
      created_at,
      transactions (
        amount,
        type,
        is_deleted
      )
    `)
    .eq('is_archived', false)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  return (
    data?.map((wallet) => {
      const balance = calculateBalance(
  wallet.transactions,
)

      return {
        id: wallet.id,
        name: wallet.name,
        color: wallet.color,
        balance,
      }
    }) ?? []
  )
}

export async function getWalletBalance(
  walletId: string,
) {
  const { data, error } =
    await supabase
      .from('transactions')
      .select(`
        amount,
        type,
        is_deleted
      `)
      .eq('wallet_id', walletId)

  if (error) {
    throw new Error(error.message)
  }

  return (
    data ?? []
  ).reduce(
    (total, transaction) => {
      if (transaction.is_deleted) {
        return total
      }

      if (
        transaction.type ===
        'income'
      ) {
        return (
          total +
          Number(transaction.amount)
        )
      }

      return (
        total -
        Number(transaction.amount)
      )
    },
    0,
  )
}

export async function archiveWallet(
  id: string,
) {
  const { error } = await supabase
    .from('wallets')
    .update({
      is_archived: true,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}