import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  archiveCategory,
} from '@/services/category-service'

export function useArchiveCategory() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: archiveCategory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['all-categories'],
      })
    },
  })
}