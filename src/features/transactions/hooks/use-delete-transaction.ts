import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { deleteTransaction } from '@/services/transaction-service'

export function useDeleteTransaction() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['wallets'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ])
    },
  })
}