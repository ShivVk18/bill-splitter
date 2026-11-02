
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

type Props = {
  loading: boolean
  disabled: boolean
  onCreate: (title: string, totalCents: number) => Promise<void>
}

export function CreateBillForm({ loading, disabled, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const rupees = Number(amount)
    if (!title.trim() || !Number.isFinite(rupees) || rupees <= 0) return

    await onCreate(title.trim(), Math.round(rupees * 100))
    setTitle('')
    setAmount('')
  }

  return (
    <Card>
      <div className="card-heading">
        <div>
          <h2>Create a bill</h2>
          <p>The amount will be split equally among members.</p>
        </div>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            id="bill-title"
            label="Bill title"
            placeholder="e.g. Electricity"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id="bill-amount"
            label="Amount (₹)"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading || disabled}
        >
          {loading ? 'Creating...' : 'Create and split bill'}
        </Button>

        {disabled && (
          <p className="muted">Add at least one member before creating a bill.</p>
        )}
      </form>
    </Card>
  )
}
