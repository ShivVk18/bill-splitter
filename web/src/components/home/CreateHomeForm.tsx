
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

type Props = {
  loading: boolean
  onCreate: (name: string) => Promise<void>
}

export function CreateHomeForm({ loading, onCreate }: Props) {
  const [name, setName] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    await onCreate(name.trim())
    setName('')
  }

  return (
    <Card style={{ maxWidth: 520, margin: '50px auto' }}>
      <div className="eyebrow">GET STARTED</div>
      <h1 style={{ fontSize: 28, letterSpacing: -1, marginBottom: 7 }}>
        Create your household
      </h1>
      <p className="muted">
        Create a shared space to manage expenses with your flatmates.
      </p>

      <form onSubmit={handleSubmit} className="form-stack">
        <Input
          id="home-name"
          label="Household name"
          placeholder="e.g. Flat 4B"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create household →'}
        </Button>
      </form>
    </Card>
  )
}
