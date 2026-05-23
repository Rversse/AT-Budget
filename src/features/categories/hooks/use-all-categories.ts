import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

export function useAllCategories() {
  return useQuery({
    queryKey: ['all-categories'],

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from('categories')
          .select('*')
          .eq(
            'is_archived',
            false,
          )
          .order('name')

      if (error) {
        throw new Error(error.message)
      }

      return data ?? []
    },
  })
}