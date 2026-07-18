import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Login from './Login'

const mockSignIn = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: { auth: { signInWithPassword: (...args) => mockSignIn(...args) } },
}))

describe('Login', () => {
  beforeEach(() => mockSignIn.mockReset())

  it('has no sign-up option — this is a single-user app', () => {
    render(<Login />)
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/הרשמה/)).not.toBeInTheDocument()
  })

  it('signs in with the entered email and password', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    render(<Login />)

    await userEvent.type(screen.getByPlaceholderText(/אימייל/), 'yaniv@example.com')
    await userEvent.type(screen.getByPlaceholderText(/סיסמה/), 'hunter2')
    await userEvent.click(screen.getByRole('button', { name: /כניסה/ }))

    expect(mockSignIn).toHaveBeenCalledWith({ email: 'yaniv@example.com', password: 'hunter2' })
  })

  it('shows the error message when sign-in fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    render(<Login />)

    await userEvent.type(screen.getByPlaceholderText(/אימייל/), 'yaniv@example.com')
    await userEvent.type(screen.getByPlaceholderText(/סיסמה/), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /כניסה/ }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })
})
