
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'dark'
  small?: boolean
}

export function Button({
  children,
  variant = 'dark',
  small = false,
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`button ${variant === 'primary' ? 'button-primary' : ''} ${variant === 'secondary' ? 'button-secondary' : ''} ${small ? 'button-small' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
