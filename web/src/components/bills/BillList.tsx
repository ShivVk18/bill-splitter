
import type { Bill, Member } from '../../types'
import { Card } from '../ui/Card'
import { BillCard } from './BillCard'

type Props = {
  bills: Bill[]
  members: Member[]
  loading: boolean
  onPay: (billId: string, shareId: string) => void
}

export function BillList({ bills, members, loading, onPay }: Props) {
  return (
    <Card>
      <div className="card-heading">
        <div>
          <h2>Recent bills</h2>
          <p>Track payments and outstanding shares.</p>
        </div>
        <span className="status status-pending">{bills.length} bills</span>
      </div>

      {bills.length === 0 ? (
        <div className="empty-state">
          <strong>No bills yet</strong>
          Create your first bill to see the split here.
        </div>
      ) : (
        bills.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            members={members}
            loading={loading}
            onPay={onPay}
          />
        ))
      )}
    </Card>
  )
}
