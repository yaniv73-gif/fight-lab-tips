import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddTipWizard from './AddTipWizard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockCreateTip = vi.fn()
const mockAttachVideo = vi.fn()
vi.mock('../lib/tips', () => ({
  createTip: (...args) => mockCreateTip(...args),
  attachVideo: (...args) => mockAttachVideo(...args),
}))

async function goToStep3(user, { withLink } = {}) {
  render(<MemoryRouter><AddTipWizard /></MemoryRouter>)
  if (withLink) {
    await user.type(screen.getByPlaceholderText(/הדבק קישור/), withLink)
    await user.click(screen.getByRole('button', { name: 'הבא' }))
  } else {
    await user.click(screen.getByRole('button', { name: 'דלג' }))
  }
  await user.type(screen.getByPlaceholderText(/לדוגמה: קרוס פייס/), 'קרוס פייס')
  await user.type(screen.getByPlaceholderText(/קטגוריה/), 'שליטה ולחץ')
  await user.click(screen.getByRole('button', { name: 'הבא' }))
}

describe('AddTipWizard', () => {
  const user = userEvent.setup()
  beforeEach(() => { mockCreateTip.mockReset(); mockAttachVideo.mockReset(); mockNavigate.mockReset() })

  it('starts on step 1 showing the record/link/skip options', () => {
    render(<MemoryRouter><AddTipWizard /></MemoryRouter>)
    expect(screen.getByText(/שלב 1 מתוך 3/)).toBeInTheDocument()
  })

  it('advances to step 2 when skipping video, and to step 3 after title+category', async () => {
    await goToStep3(user)
    expect(screen.getByText(/שלב 3 מתוך 3/)).toBeInTheDocument()
  })

  it('saves an idea-only tip (no video) with tags and note from step 3', async () => {
    mockCreateTip.mockResolvedValue({ id: 'new-1' })
    await goToStep3(user)
    await user.type(screen.getByPlaceholderText(/תגי טכניקות/), 'ארמבר, סייד')
    await user.type(screen.getByPlaceholderText(/הערה קצרה/), 'הערה לדוגמה')
    await user.click(screen.getByRole('button', { name: 'שמור' }))

    expect(mockCreateTip).toHaveBeenCalledWith({
      title: 'קרוס פייס',
      category: 'שליטה ולחץ',
      tags: ['ארמבר', 'סייד'],
      note: 'הערה לדוגמה',
      youtube_url: null,
    })
    expect(mockAttachVideo).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/tips/new-1')
  })

  it('includes the pasted YouTube link when one was given in step 1', async () => {
    mockCreateTip.mockResolvedValue({ id: 'new-2' })
    await goToStep3(user, { withLink: 'https://youtu.be/abc' })
    await user.click(screen.getByRole('button', { name: 'שמור' }))

    expect(mockCreateTip).toHaveBeenCalledWith(expect.objectContaining({ youtube_url: 'https://youtu.be/abc' }))
  })

  it('disables the step 2 next button until title and category are both filled', async () => {
    render(<MemoryRouter><AddTipWizard /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'דלג' }))
    expect(screen.getByRole('button', { name: 'הבא' })).toBeDisabled()
    await user.type(screen.getByPlaceholderText(/לדוגמה: קרוס פייס/), 'קרוס פייס')
    expect(screen.getByRole('button', { name: 'הבא' })).toBeDisabled()
    await user.type(screen.getByPlaceholderText(/קטגוריה/), 'שליטה ולחץ')
    expect(screen.getByRole('button', { name: 'הבא' })).not.toBeDisabled()
  })

  it('disables save while saving and shows an error message if createTip fails', async () => {
    let rejectSave
    mockCreateTip.mockReturnValue(new Promise((_resolve, reject) => { rejectSave = reject }))
    await goToStep3(user)
    await user.type(screen.getByPlaceholderText(/תגי טכניקות/), 'ארמבר')
    await user.click(screen.getByRole('button', { name: 'שמור' }))

    expect(screen.getByRole('button', { name: 'שומר...' })).toBeDisabled()

    rejectSave(new Error('נכשל'))
    expect(await screen.findByText('נכשל')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'שמור' })).not.toBeDisabled()
  })

  it('shows an exit button on every step that navigates to the dashboard', async () => {
    render(<MemoryRouter><AddTipWizard /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'סגור וחזור לדשבורד' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'דלג' }))
    expect(screen.getByRole('button', { name: 'סגור וחזור לדשבורד' })).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/לדוגמה: קרוס פייס/), 'x')
    await user.type(screen.getByPlaceholderText(/קטגוריה/), 'y')
    await user.click(screen.getByRole('button', { name: 'הבא' }))
    expect(screen.getByRole('button', { name: 'סגור וחזור לדשבורד' })).toBeInTheDocument()
  })

  it('navigates to the dashboard when the exit button is clicked, without saving', async () => {
    render(<MemoryRouter><AddTipWizard /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'סגור וחזור לדשבורד' }))
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    expect(mockCreateTip).not.toHaveBeenCalled()
  })

  it('disables the exit button while a save is in flight', async () => {
    let resolveSave
    mockCreateTip.mockReturnValue(new Promise(resolve => { resolveSave = resolve }))
    await goToStep3(user)
    await user.type(screen.getByPlaceholderText(/תגי טכניקות/), 'ארמבר')
    await user.click(screen.getByRole('button', { name: /שמור/ }))
    expect(screen.getByRole('button', { name: 'סגור וחזור לדשבורד' })).toBeDisabled()
    resolveSave({ id: 'new-1' })
  })
})
