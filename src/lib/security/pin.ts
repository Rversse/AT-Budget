const PIN_KEY = 'app_pin'

export function getSavedPin() {
  return localStorage.getItem(
    PIN_KEY,
  )
}

export function savePin(pin: string) {
  localStorage.setItem(
    PIN_KEY,
    pin,
  )
}

export function verifyPin(
  pin: string,
) {
  return getSavedPin() === pin
}