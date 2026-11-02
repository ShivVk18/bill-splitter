
import type { Balance } from '../../types'
import { formatCurrency } from '../../utils/currency.utils'
import { Card } from '../ui/Card'

type Props = {
  balances: Balance[]
}

export function BalanceSummary({ balances }: Props) {
  return (
    <Card>
      <div className="card-heading">
        <div>
          <h2>Outstanding balances</h2>
          <p>What each member still owes.</p>
        </div>
      </div>

      {balances.length === 0 ? (
        <div className="empty-state">
          No balances to show yet.
        </div>
      ) : (
        balances.map((balance) => (
          <div className="balance-row" key={balance.memberId}>
            <div className="share-person">
              <span className="member-avatar">
                {balance.name.charAt(0).toUpperCase()}
              </span>
              <span className="share-name">{balance.name}</span>
            </div>

            <strong>{formatCurrency(balance.outstandingCents)}</strong>
          </div>
        ))
      )}
    </Card>
  )
}
