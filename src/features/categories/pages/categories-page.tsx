/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { toast } from 'sonner'

import { useAllCategories } from '../hooks/use-all-categories'
import { useCreateCategory } from '../hooks/use-create-category'
import { useArchiveCategory } from '../hooks/use-archive-category'

export function CategoriesPage() {
  const categoriesQuery =
    useAllCategories()

  const createCategoryMutation =
    useCreateCategory()

  const archiveCategoryMutation =
    useArchiveCategory()

  const [name, setName] =
    useState('')

  const [type, setType] =
    useState<
      'income' | 'expense'
    >('expense')

  const [
    archivingCategoryId,
    setArchivingCategoryId,
  ] = useState<
    string | null
  >(null)

  async function handleCreate() {
    if (!name.trim()) {
      toast.error(
        'Category name required',
      )

      return
    }

    try {
      await createCategoryMutation.mutateAsync(
        {
          name,
          type,
        },
      )

      setName('')

      toast.success(
        'Category created',
      )
    } catch (error) {
      console.error(error)

      if (
        error instanceof Error
      ) {
        toast.error(
          error.message,
        )
      } else {
        toast.error(
          'Failed to create category',
        )
      }
    }
  }

  async function handleArchive(
    id: string,
  ) {
    try {
      await archiveCategoryMutation.mutateAsync(
        id,
      )

      setArchivingCategoryId(
        null,
      )

      toast.success(
        'Category archived',
      )
    } catch (error) {
      console.error(error)

      toast.error(
        'Failed to archive category',
      )
    }
  }

  if (categoriesQuery.isLoading) {
  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-32">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />

        <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="h-52 animate-pulse rounded-2xl bg-zinc-200" />

      <div className="space-y-3">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-zinc-200"
            />
          ),
        )}
      </div>
    </div>
  )
}

  const categories =
    (categoriesQuery.data ??
      []) as any[]
      
      const filteredCategories =
  categories.filter(
    (category) =>
      category.type === type,
  )

  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-32">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Categories
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Organize your transactions
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              className={
                type ===
                'expense'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700'
              }
              onClick={() =>
                setType(
                  'expense',
                )
              }
            >
              Expense
            </Button>

            <Button
              type="button"
              className={
                type ===
                'income'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700'
              }
              onClick={() =>
                setType(
                  'income',
                )
              }
            >
              Income
            </Button>
          </div>

              <Input
                className="h-12 rounded-xl border bg-white shadow-sm"
                placeholder="Category name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate()
                  }
                }}
              />

          <Button
            className="h-12 w-full rounded-xl text-base font-semibold shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleCreate}
            disabled={
              createCategoryMutation.isPending
            }
          >
            {createCategoryMutation.isPending
              ? 'Saving...'
              : 'Add Category'}
          </Button>
        </CardContent>
      </Card>

      {categories.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
<div className="text-4xl">
  🏷️
</div>

<p className="mt-4 text-base font-medium">
  No categories yet
</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create categories to organize your transactions
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredCategories
          .filter(
            (
              category: any,
            ) => {
              const normalizedName =
                category.name
                  ?.trim()
                  ?.toLowerCase()

              return (
                normalizedName !==
                  'transfer in' &&
                normalizedName !==
                  'transfer out'
              )
            },
          )
          .map(
            (
              category: any,
            ) => (
              <Card
                key={
                  category.id
                }
                className="border-0 shadow-sm transition active:scale-[0.98]"
              >
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div className="space-y-3">
<div className="flex items-start justify-between gap-3">
  <p className="text-lg font-semibold">
    {category.name}
  </p>

  <p
    className={
      category.type ===
      'income'
        ? 'inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700'
        : 'inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700'
    }
  >
    {category.type}
  </p>
</div>

                    {archivingCategoryId ===
                    category.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-xs font-medium text-red-500 transition hover:text-red-600"
                          onClick={() =>
                            handleArchive(
                              category.id,
                            )
                          }
                        >
                          Confirm
                        </button>

                        <button
                          type="button"
                          className="text-xs text-muted-foreground transition hover:text-black"
                          onClick={() =>
                            setArchivingCategoryId(
                              null,
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground transition hover:text-red-500"
                        onClick={() =>
                          setArchivingCategoryId(
                            category.id,
                          )
                        }
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ),
          )}
      </div>
    </div>
  )
}