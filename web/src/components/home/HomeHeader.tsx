
type Props = {
  name: string
  memberCount: number
  billCount: number
}

export function HomeHeader({ name, memberCount, billCount }: Props) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">YOUR HOUSEHOLD</div>
        <h1>{name}</h1>
        <div className="muted">
          {memberCount} members · {billCount} bills
        </div>
      </div>
      <span className="status status-pending">HOUSEHOLD</span>
    </div>
  )
}
