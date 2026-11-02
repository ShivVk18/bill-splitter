
import type { ReactNode } from 'react'
import { Header } from './Header'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="container page-content">{children}</main>
      <footer className="footer">
        <div className="container">
          HouseSplit · Keep household expenses simple.
        </div>
      </footer>
    </div>
  )
}
