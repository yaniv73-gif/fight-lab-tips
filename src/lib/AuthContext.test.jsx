import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, useUser } from './AuthContext'

const mockOnAuthStateChange = vi.fn()
const mockGetSession = vi.fn()

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
    },
  },
}))

function Probe() {
  const user = useUser()
  if (user === undefined) return <div>loading</div>
  return <div>{user ? `signed in as ${user.email}` : 'signed out'}</div>
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockGetSession.mockReset()
    mockOnAuthStateChange.mockReset()
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  })

  it('starts in a loading state, then reflects an existing session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { email: 'yaniv@example.com' } } } })

    render(<AuthProvider><Probe /></AuthProvider>)

    expect(screen.getByText('loading')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('signed in as yaniv@example.com')).toBeInTheDocument())
  })

  it('shows signed out when there is no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByText('signed out')).toBeInTheDocument())
  })
})
