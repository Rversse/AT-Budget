import { useQuery } from '@tanstack/react-query'

import { getTransactions } from '@/services/transaction-service'

export function useTransactions(
  month?: string,
) {
  return useQuery({
    queryKey: [
      'transactions',
      month,
    ],

    queryFn: () =>
      getTransactions(month),
  })
}