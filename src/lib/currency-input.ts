export function formatCurrencyInput(
  value: string,
) {
  const numeric =
    value.replace(/\D/g, '')

  if (!numeric) {
    return ''
  }

  return Number(
    numeric,
  ).toLocaleString('id-ID')
}

export function parseCurrencyInput(
  value: string,
) {
  return Number(
    value.replace(/\D/g, ''),
  )
}