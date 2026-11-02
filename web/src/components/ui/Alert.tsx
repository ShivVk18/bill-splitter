
type Props = {
  message: string
  type: 'error' | 'success'
}

export function Alert({ message, type }: Props) {
  if (!message) return null

  return (
    <div
      className={`alert ${type === 'error' ? 'alert-error' : 'alert-success'}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  )
}
