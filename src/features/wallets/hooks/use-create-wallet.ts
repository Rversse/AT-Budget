import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { createWallet } from '@/services/wallet-service'

export function useCreateWallet() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: createWallet,

    onSuccess: async () => {
      await Promise.all([
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