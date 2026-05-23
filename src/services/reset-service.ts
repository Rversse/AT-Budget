import { supabase } from '@/lib/supabase/client'

import {
  assertOnline,
} from '@/lib/utils/assert-online'

export async function resetAllData() {
  assertOnline()

  const [
    transactionsResult,
    walletsResult,
    categoriesResult,
  ] = await Promise.all([
    supabase
      .from('transactions')
      .delete()
      .not('id', 'is', null),

    supabase
      .from('wallets')
      .delete()
      .not('id', 'is', null),

    supabase
      .from('categories')
      .delete()
      .not('id', 'is', null),
  ])

  if (
    transactionsResult.error
  ) {
    throw new Error(
      transactionsResult.error
        .message,
    )
  }

  if (walletsResult.error) {
    throw new Error(
      walletsResult.error.message,
    )
  }

  if (
    categoriesResult.error
  ) {
    throw new Error(
      categoriesResult.error
        .message,
    )
  }
}