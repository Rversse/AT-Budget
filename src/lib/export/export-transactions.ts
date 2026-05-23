import Papa from 'papaparse'

type Transaction = {
  id: string

  amount: number

  type:
    | 'income'
    | 'expense'

  note?: string | null

  transaction_date: string

  transfer_group_id?:
    | string
    | null

  wallets?: {
    name: string
  }

  categories?:
    | {
        name: string
      }
    | null
}

type ExportRow = {
  Date: string

  Type:
    | 'income'
    | 'expense'
    | 'transfer'

  Wallet: string

  Category: string

  Amount: number

  Note: string
}

export function exportTransactions(
  transactions: Transaction[],
  month: string,
) {
  const groupedTransfers =
    new Map<
      string,
      {
        fromWallet: string
        toWallet: string
        amount: number
        note: string
        transaction_date: string
      }
    >()

  const rows: ExportRow[] =
    []

  transactions.forEach(
    (transaction) => {
      if (
        !transaction.transfer_group_id
      ) {
        rows.push({
          Date:
            transaction.transaction_date,

          Type:
            transaction.type,

          Wallet:
            transaction.wallets
              ?.name || '',

          Category:
            transaction.categories
              ?.name || '',

          Amount:
            transaction.amount,

          Note:
            transaction.note ||
            '',
        })

        return
      }

      const existingTransfer =
        groupedTransfers.get(
          transaction.transfer_group_id,
        ) || {
          fromWallet: '',
          toWallet: '',
          amount:
            transaction.amount,
          note:
            transaction.note ||
            '',
          transaction_date:
            transaction.transaction_date,
        }

      if (
        transaction.type ===
        'expense'
      ) {
        existingTransfer.fromWallet =
          transaction.wallets
            ?.name || ''
      }

      if (
        transaction.type ===
        'income'
      ) {
        existingTransfer.toWallet =
          transaction.wallets
            ?.name || ''
      }

      groupedTransfers.set(
        transaction.transfer_group_id,
        existingTransfer,
      )
    },
  )

  groupedTransfers.forEach(
    (transfer) => {
      rows.push({
        Date:
          transfer.transaction_date,

        Type: 'transfer',

        Wallet: `${transfer.fromWallet} → ${transfer.toWallet}`,

        Category: '-',

        Amount:
          transfer.amount,

        Note:
          transfer.note,
      })
    },
  )

  rows.sort(
    (a, b) =>
      new Date(
        b.Date,
      ).getTime() -
      new Date(
        a.Date,
      ).getTime(),
  )

const csv = Papa.unparse(
  rows,
  {
    delimiter: ';',
  },
)

const blob = new Blob(
  ['\uFEFF' + csv],
    {
      type: 'text/csv;charset=utf-8;',
    },
  )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url

  link.setAttribute(
    'download',
    `at-budget-${month}.csv`,
  )

  document.body.appendChild(
    link,
  )

  link.click()

  document.body.removeChild(
    link,
  )

  URL.revokeObjectURL(url)
}