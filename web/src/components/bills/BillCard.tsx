
import type { Bill, Member } from '../../types'
import { formatCurrency } from '../../utils/currency.utils'
import { ShareRow } from './ShareRow'

type Props = {
  bill: Bill
  members: Member[]
  loading: boolean
  onPay: (billId: string, shareId: string) => void
}

export function BillCard({ bill, members, loading, onPay }: Props) {
  const paidCount = bill.shares.filter((share) => share.paidAt).length
  const progress =
    bill.shares.length === 0
      ? 0
      : (paidCount / bill.shares.length) * 100

  return (
    <article className="bill-card">
      <div className="bill-top">
        <div>
          <div className="bill-title">{bill.title}</div>
          <div className="bill-subtitle">
            {paidCount} of {bill.shares.length} shares paid
          </div>
        </div>
        <div className="bill-total">{formatCurrency(bill.totalCents)}</div>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {bill.shares.map((share) => {
        const member = members.find((item) => item.id === share.memberId)

        return (
          <ShareRow
            key={share.id}
            share={share}
            memberName={member?.name ?? `Member ${share.memberId}`}
            loading={loading}
            onPay={() => onPay(bill.id, share.id)}
          />
        )
      })}
    </article>
  )
}
