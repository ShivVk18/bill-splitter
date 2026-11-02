
import type { Share } from '../../types'
import { formatCurrency } from '../../utils/currency.utils'
import { Button } from '../ui/Button'

type Props = {
  share: Share
  memberName: string
  loading: boolean
  onPay: () => void
}

export function ShareRow({
  share,
  memberName,
  loading,
  onPay,
}: Props) {
  return (
    <div className="share-row">
      <div className="share-person">
        <span className="member-avatar">
          {memberName.charAt(0).toUpperCase()}
        </span>
        <div>
          <div className="share-name">{memberName}</div>
          <div className="share-amount">
            {formatCurrency(share.amountCents)}
          </div>
        </div>
      </div>

      {share.paidAt ? (
        <span className="status status-paid">✓ Paid</span>
      ) : (
        <Button small disabled={loading} onClick={onPay}>
          Mark paid
        </Button>
      )}
    </div>
  )
}
