import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { updateTransaction } from '@/services/transaction-service'

export function useUpdateTransaction() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: updateTransaction,

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