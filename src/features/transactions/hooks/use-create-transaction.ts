import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { createTransaction } from '@/services/transaction-service'

type CreateTransactionInput = {
  type: 'income' | 'expense'

  walletId: string

  categoryId: string

  amount: number

  note?: string

  transactionDate: string
}

export function useCreateTransaction() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: CreateTransactionInput,
    ) => createTransaction(input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['wallets'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ])
    },
  })
}