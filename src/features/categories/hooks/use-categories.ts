import { useQuery } from '@tanstack/react-query'

import { getCategories } from '@/services/category-service'

export function useCategories(
  type: 'income' | 'expense',
) {
  return useQuery({
    queryKey: ['categories', type],

    queryFn: () => getCategories(type),
  })
}