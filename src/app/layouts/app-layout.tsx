import { useEffect, useState } from 'react'

import {
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { BottomNav } from '@/components/layout/bottom-nav'

import { PinLockScreen } from '@/features/auth/components/pin-lock-screen'

export function AppLayout() {

  const [unlocked, setUnlocked] =
  useState(() => {
    return (
      sessionStorage.getItem(
        'unlocked',
      ) === 'true'
    )
  })

  const navigate =
    useNavigate()

  useEffect(() => {
  function lockApp() {
    sessionStorage.removeItem(
      'unlocked',
    )

    sessionStorage.removeItem(
      'last-active-at',
    )

    setUnlocked(false)

    navigate('/')
  }

  function handleLockApp() {
    lockApp()
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      sessionStorage.setItem(
        'last-active-at',
        Date.now().toString(),
      )
    } else {
      const lastActiveAt =
        sessionStorage.getItem(
          'last-active-at',
        )

      if (!lastActiveAt) {
        return
      }

      const inactiveTime =
        Date.now() -
        Number(lastActiveAt)

      const twoHours =
        1000 *
        60 *
        60 *
        2

      if (
        inactiveTime >
        twoHours
      ) {
        lockApp()
      } else {
        sessionStorage.removeItem(
          'last-active-at',
        )
      }
    }
  }

  window.addEventListener(
    'lock-app',
    handleLockApp,
  )

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange,
  )

  return () => {
    window.removeEventListener(
      'lock-app',
      handleLockApp,
    )

    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )
  }
}, [navigate])

  if (!unlocked) {
    return (
      <PinLockScreen
        onUnlock={() => {
          sessionStorage.setItem(
            'unlocked',
            'true',
          )

          setUnlocked(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-md p-4 pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}