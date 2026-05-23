export function assertOnline() {
  if (!navigator.onLine) {
    throw new Error(
      'No internet connection',
    )
  }
}