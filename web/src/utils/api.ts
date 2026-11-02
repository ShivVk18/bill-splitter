const API_BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? 'Something went wrong',
    )
  }

  return data as T
}

export const api = {
  createHome: (name: string) =>
    request<{ id: string; name: string }>('/homes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  addMember: (homeId: string, name: string) =>
    request<{ id: string; homeId: string; name: string }>(
      `/homes/${homeId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
    ),

  createBill: (homeId: string, title: string, totalCents: number) =>
    request<Bill>(`/homes/${homeId}/bills`, {
      method: 'POST',
      body: JSON.stringify({ title, totalCents }),
    }),

  payShare: (billId: string, shareId: string, key: string) =>
    request<PaidShare>(
      `/bills/${billId}/shares/${shareId}/pay`,
      {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
      },
    ),

  getBalances: (homeId: string) =>
    request<{ balances: Balance[] }>(
      `/homes/${homeId}/balances`,
    ),
}

export type Share = {
  id: string
  memberId: string
  amountCents: number
  paidAt: string | null
}

export type Bill = {
  id: string
  homeId: string
  title: string
  totalCents: number
  shares: Share[]
}

export type PaidShare = {
  id: string
  memberId: string
  amountCents: number
  paidAt: string
}

export type Balance = {
  memberId: string
  name: string
  outstandingCents: number
}