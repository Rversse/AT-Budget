import * as React from 'react'

type DivProps =
  React.HTMLAttributes<HTMLDivElement>

export function Card({
  className = '',
  ...props
}: DivProps) {
  return (
    <div
      className={[
        'rounded-xl border bg-background',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

export function CardContent({
  className = '',
  ...props
}: DivProps) {
  return (
    <div
      className={className}
      {...props}
    />
  )
}