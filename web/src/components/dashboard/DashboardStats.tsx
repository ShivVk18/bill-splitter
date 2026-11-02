import { formatCurrency } from '../../utils/currency.utils'
import { Card } from '../ui/Card'

type Props = {
  totalOutstanding: number
  memberCount: number
  billCount: number
}

export function DashboardStats({
  totalOutstanding,
  memberCount,
  billCount,
}: Props) {
  const stats = [
    {
      label: 'Total outstanding',
      value: formatCurrency(totalOutstanding),
      note: 'Unpaid across all bills',
    },
    {
      label: 'Household members',
      value: memberCount.toString(),
      note: 'People sharing expenses',
    },
    {
      label: 'Total bills',
      value: billCount.toString(),
      note: 'Recorded expenses',
    },
  ]

  return (
    <div className="grid stats-grid">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-footnote">{stat.note}</div>
        </Card>
      ))}
    </div>
  )
}
