
import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: Props) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  )
}
