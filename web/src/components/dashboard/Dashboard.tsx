
import type { Bill, Balance, Home, Member } from '../../types'
import { HomeHeader } from '../home/HomeHeader'
import { MemberSection } from '../home/MemberSection'
import { CreateBillForm } from '../bills/CreateBillForm'
import { BillList } from '../bills/BillList'
import { DashboardStats } from './DashboardStats'
import { BalanceSummary } from './BalanceSummary'

type Props = {
  home: Home
  members: Member[]
  bills: Bill[]
  balances: Balance[]
  loading: boolean
  onAddMember: (name: string) => Promise<void>
  onCreateBill: (title: string, totalCents: number) => Promise<void>
  onPay: (billId: string, shareId: string) => void
}

export function Dashboard({
  home,
  members,
  bills,
  balances,
  loading,
  onAddMember,
  onCreateBill,
  onPay,
}: Props) {
  const totalOutstanding = balances.reduce(
    (sum, balance) => sum + balance.outstandingCents,
    0,
  )

  return (
    <>
      <HomeHeader
        name={home.name}
        memberCount={members.length}
        billCount={bills.length}
      />

      <DashboardStats
        totalOutstanding={totalOutstanding}
        memberCount={members.length}
        billCount={bills.length}
      />

      <div className="grid main-grid">
        <div className="stack">
          <MemberSection
            members={members}
            loading={loading}
            onAdd={onAddMember}
          />

          <CreateBillForm
            loading={loading}
            disabled={members.length === 0}
            onCreate={onCreateBill}
          />

          <BillList
            bills={bills}
            members={members}
            loading={loading}
            onPay={onPay}
          />
        </div>

        <div className="stack">
          <BalanceSummary balances={balances} />
        </div>
      </div>
    </>
  )
}
