
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { CreateHomeForm } from '../components/home/CreateHomeForm'
import { Dashboard } from '../components/dashboard/Dashboard'
import { Alert } from '../components/ui/Alert'
import { api } from '../utils/api'
import type { Home, Member, Bill, Balance } from '../types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [home, setHome] = useState<Home | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function perform<T>(action: () => Promise<T>): Promise<T | undefined> {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      return await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      return undefined
    } finally {
      setLoading(false)
    }
  }

  async function refreshBalances(homeId: string) {
    const result = await api.getBalances(homeId)
    setBalances(result.balances)
  }

  async function createHome(name: string) {
    const result = await perform(() => api.createHome(name))
    if (!result) return

    setHome(result)
    setSuccess('Household created successfully!')
  }

  async function addMember(name: string) {
    if (!home) return

    const result = await perform(() => api.addMember(home.id, name))
    if (!result) return

    setMembers((current) => [...current, result])
    setSuccess(`${result.name} added successfully!`)
    await perform(() => refreshBalances(home.id))
  }

  async function createBill(title: string, totalCents: number) {
    if (!home) return

    const result = await perform(() =>
      api.createBill(home.id, title, totalCents),
    )
    if (!result) return

    setBills((current) => [result, ...current])
    setSuccess('Bill created successfully!')
    await perform(() => refreshBalances(home.id))
  }

  async function payShare(billId: string, shareId: string) {
    if (!home) return

    const result = await perform(() =>
      api.payShare(billId, shareId, crypto.randomUUID()),
    )
    if (!result) return

    setBills((current) =>
      current.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              shares: bill.shares.map((share) =>
                share.id === shareId
                  ? { ...share, paidAt: result.paidAt }
                  : share,
              ),
            }
          : bill,
      ),
    )

    await perform(() => refreshBalances(home.id))
    setSuccess('Payment marked as paid!')
  }

  return (
    <AppLayout>
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {!home ? (
        <CreateHomeForm loading={loading} onCreate={createHome} />
      ) : (
        <Dashboard
          home={home}
          members={members}
          bills={bills}
          balances={balances}
          loading={loading}
          onAddMember={addMember}
          onCreateBill={createBill}
          onPay={payShare}
        />
      )}
    </AppLayout>
  )
}
