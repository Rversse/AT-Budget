import { useQuery } from '@tanstack/react-query'

import { getExpenseCategories } from '@/services/category-service'

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: getExpenseCategories,
  })
}