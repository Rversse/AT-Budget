import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import {
  getSavedPin,
  savePin,
  verifyPin,
} from '@/lib/security/pin'

import { useState } from 'react'

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

  const creatingPin = !savedPin

  function handleSubmit() {
    if (creatingPin) {
      if (pin.length !== 4) {
        alert(
          'PIN must be 4 digits',
        )

        return
      }

      if (pin !== confirmPin) {
        alert('PIN not match')

        return
      }

      savePin(pin)

      props.onUnlock()

      return
    }

    const valid = verifyPin(pin)

    if (!valid) {
      alert('Wrong PIN')

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
  className="text-center text-2xl tracking-[12px]"
  value={pin}
  onChange={(e) => {
    const value =
      e.target.value.replace(
        /\D/g,
        '',
      )

    setPin(value)
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }}
/>

          {creatingPin && (
            <Input
              className="text-center text-2xl tracking-[12px]"
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

          <Button
            className="w-full"
            onClick={handleSubmit}
          >
            {creatingPin
              ? 'Create PIN'
              : 'Unlock'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}