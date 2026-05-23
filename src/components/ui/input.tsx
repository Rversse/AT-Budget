import * as React from 'react'

type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>

export function Input({
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      className={[
        'w-full rounded-md border px-3 py-2 text-sm',
        'outline-none',
        className,
      ].join(' ')}
      {...props}
    />
  )
}