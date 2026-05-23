import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { archiveWallet } from '@/services/wallet-service'

export function useArchiveWallet() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: archiveWallet,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['wallets'],
      })
    },
  })
}