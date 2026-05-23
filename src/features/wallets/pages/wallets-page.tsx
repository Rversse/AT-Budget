/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { toast } from 'sonner'

import { useWallets } from '../hooks/use-wallets'
import { useCreateWallet } from '../hooks/use-create-wallet'
import { useArchiveWallet } from '../hooks/use-archive-wallet'

export function WalletsPage() {
  const walletsQuery =
    useWallets()

const walletColors = [
  '#111827',
  '#1d4ed8',
  '#15803d',
  '#b91c1c',
  '#a16207',
  '#7e22ce',
  '#0f766e',
  '#374151',
]

  const [color, setColor] =
    useState(getRandomColor)

  const createWalletMutation =
    useCreateWallet()

  const archiveWalletMutation =
    useArchiveWallet()

  const [name, setName] =
    useState('')

  const [
    archivingWalletId,
    setArchivingWalletId,
  ] = useState<
    string | null
  >(null)

  async function handleCreateWallet() {
    if (!name.trim()) {
      toast.error(
        'Wallet name required',
      )

      return
    }
    
    if (!navigator.onLine) {
  toast.error(
    'No internet connection',
  )

  return
}

    try {
      await createWalletMutation.mutateAsync({
  name,
  color,
})

      setName('')

      toast.success(
        'Wallet created',
      )
      setColor(
  walletColors[
    Math.floor(
      Math.random() *
        walletColors.length,
    )
  ],
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
      'Failed to create wallet',
    )
  }
}
  }

function getRandomColor() {
  return (
    walletColors[
      Math.floor(
        Math.random() *
          walletColors.length,
      )
    ]
  )
}


  async function handleArchive(
    id: string,
  ) {
    try {
      await archiveWalletMutation.mutateAsync(
        id,
      )

      setArchivingWalletId(
        null,
      )

      toast.success(
        'Wallet archived',
      )
    } catch (error) {
      console.error(error)

      toast.error(
        'Failed to archive wallet',
      )
    }
  }

  if (walletsQuery.isLoading) {
  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-32">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />

        <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />

      <div className="space-y-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-zinc-200"
            />
          ),
        )}
      </div>
    </div>
  )
}

  const wallets =
    (walletsQuery.data ??
      []) as any[]

  return (
    <div className="min-h-screen space-y-6 bg-zinc-50 p-4 pb-32">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Wallets
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your money sources
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <Input
            placeholder="Wallet name"
            className="h-12 rounded-xl border bg-white shadow-sm"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value,
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateWallet()
              }
            }}
          />

          <div className="flex flex-wrap justify-center gap-2">
  {walletColors.map(
    (walletColor) => (
      <button
        key={walletColor}
        type="button"
        onClick={() =>
          setColor(walletColor)
        }
        className={[
          'h-8 w-8 rounded-full border-4 transition',
          color === walletColor
            ? 'border-black scale-110'
            : 'border-white',
        ].join(' ')}
        style={{
          backgroundColor:
            walletColor,
        }}
      />
    ),
  )}
</div>

          <Button
            className="h-12 w-full rounded-xl text-base font-semibold shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={
              handleCreateWallet
            }
            disabled={
              createWalletMutation.isPending
            }
          >
            {createWalletMutation.isPending
              ? 'Saving...'
              : 'Add Wallet'}
          </Button>
        </CardContent>
      </Card>

      {wallets.length === 0 && (
<Card className="border-0 shadow-sm">
  <CardContent className="flex flex-col items-center justify-center p-10 text-center">
    <div className="text-4xl">
      💳
    </div>

    <p className="mt-4 text-base font-medium">
      No wallets yet
    </p>

    <p className="mt-1 text-sm text-muted-foreground">
      Create your first wallet to start tracking money
    </p>
  </CardContent>
</Card>
      )}

      <div className="space-y-4">
        {wallets.map(
          (wallet: any) => (
            <Card
              key={wallet.id}
              className="border-0 shadow-sm transition active:scale-[0.99]"
            >
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full ring-2 ring-white"
                      style={{
                        backgroundColor:
                          wallet.color ||
                          '#888',
                      }}
                    />

                    <p className="text-lg font-semibold">
                      {wallet.name}
                    </p>
                  </div>

                  <p className="text-2xl font-bold tracking-tight">
                    Rp{' '}
                    {Number(
                      wallet.balance,
                    ).toLocaleString(
                      'id-ID',
                    )}
                  </p>

                  {archivingWalletId ===
                  wallet.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs font-medium text-red-500 transition hover:text-red-600"
                        onClick={() =>
                          handleArchive(
                            wallet.id,
                          )
                        }
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        className="text-xs text-muted-foreground transition hover:text-black"
                        onClick={() =>
                          setArchivingWalletId(
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
                        setArchivingWalletId(
                          wallet.id,
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