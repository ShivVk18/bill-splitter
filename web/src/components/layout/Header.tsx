
export function Header() {
  return (
    <header className="topbar">
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div className="brand">
          House<span>Split.</span>
        </div>
        <div className="topbar-tag">SHARED EXPENSES, SIMPLIFIED</div>
      </div>
    </header>
  )
}
