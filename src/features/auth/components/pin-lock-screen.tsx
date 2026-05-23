import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import {
  getSavedPin,
  savePin,
  verifyPin,
} from '@/lib/security/pin'

import { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  onUnlock: () => void
}

export function PinLockScreen(
  props: Props,
) {
  const savedPin =
    getSavedPin()

  const [pin, setPin] =
    useState('')

  const [confirmPin, setConfirmPin] =
    useState('')

  const [
  isWrongPin,
  setIsWrongPin,
] = useState(false)

  const creatingPin = !savedPin

  function handleSubmit() {
    if (creatingPin) {
      if (pin.length !== 4) {
        toast.error(
          'PIN must be 4 digits',
        )

        return
      }

      if (pin !== confirmPin) {
        toast.error(
          'PIN does not match',
        )

        return
      }

      savePin(pin)

      props.onUnlock()

      return
    }

    const valid = verifyPin(pin)

    if (!valid) {
      toast.error('Wrong PIN')

      return
    }

    props.onUnlock()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 p-6">
          <div>
            <h1 className="text-xl font-semibold">
              {creatingPin
                ? 'Create PIN'
                : 'Enter PIN'}
            </h1>

            <p className="text-sm text-muted-foreground">
              Secure your finance app
            </p>
          </div>

<Input
  autoFocus
  type="password"
  inputMode="numeric"
  maxLength={4}
  placeholder="••••"
  className={[
  'pl-5 text-center font-mono text-2xl tracking-[20px] transition',
  isWrongPin
    ? 'animate-[shake_0.25s_ease-in-out]'
    : '',
  isWrongPin
    ? 'border-red-500 ring-2 ring-red-200'
    : '',
].join(' ')}
  value={pin}
  onChange={(e) => {
    const value =
      e.target.value
        .replace(/\D/g, '')
        .slice(0, 4)

    setPin(value)

    if (
      !creatingPin &&
      value.length === 4
    ) {
      const valid =
        verifyPin(value)

      if (valid) {
        props.onUnlock()

        return
      }

toast.error('Wrong PIN')

setIsWrongPin(true)

setPin('')

setTimeout(() => {
  setIsWrongPin(false)
}, 500)
    }
  }}
/>

          {creatingPin && (
            <Input
              className="pl-5 text-center font-mono text-2xl tracking-[20px]"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => {
  const value =
    e.target.value.replace(
      /\D/g,
      '',
    )

  setConfirmPin(value)
}}
            />
          )}

{creatingPin && (
  <Button
    className="w-full"
    onClick={handleSubmit}
  >
    Create PIN
  </Button>
)}

{!creatingPin && (
  <button
    type="button"
    className="w-full text-sm text-muted-foreground underline underline-offset-4"
    onClick={() => {
      const confirmed =
        confirm(
          'Remove current device PIN?',
        )

      if (!confirmed) {
        return
      }

      localStorage.removeItem(
        'app_pin',
      )

      window.location.reload()
    }}
  >
    Forgot PIN?
  </button>
)}
        </CardContent>
      </Card>
    </div>
  )
}