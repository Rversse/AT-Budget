import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  Home,
  Receipt,
  Wallet,
  Tags,
  Settings
} from 'lucide-react'

const items = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },

  {
    label: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },

  {
    label: 'Wallets',
    href: '/wallets',
    icon: Wallet,
  },

  {
    label: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function BottomNav() {
  const location =
    useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-zinc-50/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const active =
            location.pathname ===
            item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={[
                'flex min-w-18 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition',

                active
                  ? 'bg-black font-semibold text-white shadow-sm'
                  : 'text-zinc-500',
              ].join(' ')}
            >
              <item.icon className="h-4 w-4" />

              <span>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}