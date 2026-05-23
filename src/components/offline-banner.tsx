import { useEffect, useState } from 'react'

import { toast } from 'sonner'

export function OfflineBanner() {
  const [isOffline, setIsOffline] =
    useState(!navigator.onLine)

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true)
    }

    function handleOnline() {
      toast.success(
        'Back online',
      )

      setIsOffline(false)
    }

    window.addEventListener(
      'offline',
      handleOffline,
    )

    window.addEventListener(
      'online',
      handleOnline,
    )

    return () => {
      window.removeEventListener(
        'offline',
        handleOffline,
      )

      window.removeEventListener(
        'online',
        handleOnline,
      )
    }
  }, [])

  if (!isOffline) {
    return null
  }

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg">
      You're offline
    </div>
  )
}