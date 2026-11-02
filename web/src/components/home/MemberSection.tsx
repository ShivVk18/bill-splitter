
import { useState, type FormEvent } from 'react'
import type { Member } from '../../types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

type Props = {
  members: Member[]
  loading: boolean
  onAdd: (name: string) => Promise<void>
}

export function MemberSection({ members, loading, onAdd }: Props) {
  const [name, setName] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    await onAdd(name.trim())
    setName('')
  }

  return (
    <Card>
      <div className="card-heading">
        <div>
          <h2>Household members</h2>
          <p>Everyone sharing the household expenses.</p>
        </div>
        <span className="status status-pending">{members.length} members</span>
      </div>

      <form className="form-row" onSubmit={handleSubmit}>
        <Input
          id="member-name"
          label="Member name"
          placeholder="e.g. Asha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          + Add member
        </Button>
      </form>

      {members.length > 0 ? (
        <div className="member-list">
          {members.map((member) => (
            <div className="member-chip" key={member.id}>
              <span className="member-avatar">
                {member.name.charAt(0).toUpperCase()}
              </span>
              {member.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Add your first household member.
        </div>
      )}
    </Card>
  )
}
