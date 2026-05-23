import * as React from 'react'

type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-md',
        'bg-black px-4 py-2 text-sm font-medium text-white',
        'disabled:opacity-50',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}