import {
  useIsFetching,
  useIsMutating,
} from '@tanstack/react-query'

export function SyncStatus() {
  const isFetching =
    useIsFetching()

  const isMutating =
    useIsMutating()

  const offline =
    !navigator.onLine

  let text =
    'All changes saved'

  let color =
    'bg-green-500'

  if (offline) {
    text = 'Offline mode'

    color = 'bg-orange-500'
  } else if (
    isFetching ||
    isMutating
  ) {
    text = 'Syncing...'

    color = 'bg-blue-500'
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div
        className={`h-2 w-2 rounded-full ${color}`}
      />

      <span>{text}</span>
    </div>
  )
}