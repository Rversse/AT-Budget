import { supabase } from '@/lib/supabase/client'
import { assertOnline } from '@/lib/utils/assert-online'

export async function getCategories(
  type: 'income' | 'expense',
) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .eq('is_archived', false)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

type CreateCategoryInput = {
  name: string

  type: 'income' | 'expense'
}

export async function createCategory(
  input: CreateCategoryInput,
) {
  assertOnline()
  const normalizedName =
    input.name
      .trim()
      .toLowerCase()

  const {
    data: existingCategories,
    error: existingError,
  } = await supabase
    .from('categories')
    .select(
      'id,name,type,is_archived',
    )

  if (existingError) {
    throw new Error(
      existingError.message,
    )
  }

  const activeCategory =
    existingCategories?.find(
      (category) =>
        category.name
          ?.trim()
          ?.toLowerCase() ===
          normalizedName &&
        category.type ===
          input.type &&
        !category.is_archived,
    )

  if (activeCategory) {
    throw new Error(
      'Category already exists',
    )
  }

  const archivedCategory =
    existingCategories?.find(
      (category) =>
        category.name
          ?.trim()
          ?.toLowerCase() ===
          normalizedName &&
        category.type ===
          input.type &&
        category.is_archived,
    )

  if (archivedCategory) {
    const { error } =
      await supabase
        .from('categories')
        .update({
          is_archived: false,
        })
        .eq(
          'id',
          archivedCategory.id,
        )

    if (error) {
      throw new Error(
        error.message,
      )
    }

    return
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      name:
        input.name.trim(),

      type: input.type,
    })

  if (error) {
    throw new Error(error.message)
  }
}

export async function archiveCategory(
  id: string,
) {
  const { error } = await supabase
    .from('categories')
    .update({
      is_archived: true,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getExpenseCategories() {
  const { data, error } =
    await supabase
      .from('categories')
      .select('*')
      .eq('type', 'expense')
      .eq(
        'is_archived',
        false,
      )
      .order('name')

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return data ?? []
}