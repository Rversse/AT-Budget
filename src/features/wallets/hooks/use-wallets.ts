import { useQuery } from '@tanstack/react-query'

import { getWallets } from '@/services/wallet-service'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: getWallets,
  })
}