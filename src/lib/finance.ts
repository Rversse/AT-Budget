type TransactionLike = {
  amount: number

  type: 'income' | 'expense'

  is_deleted?: boolean
}

export function calculateBalance(
  transactions: TransactionLike[],
) {
  return transactions.reduce(
    (total, transaction) => {
      if (transaction.is_deleted) {
        return total
      }

      const amount = Number(
        transaction.amount,
      )

      if (
        transaction.type ===
        'income'
      ) {
        return total + amount
      }

      return total - amount
    },
    0,
  )
}

export function formatCurrency(
  amount: number,
) {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',

      currency: 'IDR',

      maximumFractionDigits: 0,
    },
  ).format(amount)
}

export function formatCompactCurrency(
  amount: number,
) {
  if (
    amount >=
    1_000_000_000
  ) {
    return `Rp ${(
      amount /
      1_000_000_000
    ).toFixed(1)}B`
  }

  if (
    amount >= 1_000_000
  ) {
    return `Rp ${(
      amount / 1_000_000
    ).toFixed(1)}M`
  }

  if (
    amount >= 1_000
  ) {
    return `Rp ${(
      amount / 1_000
    ).toFixed(0)}K`
  }

  return formatCurrency(
    amount,
  )
}