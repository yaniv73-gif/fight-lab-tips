# Fight Lab Tips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 Fight Lab Tips app — a personal content-pipeline tool (Idea → Filmed → Published) for BJJ/Muay Thai/MMA teaching clips, per `docs/superpowers/specs/2026-07-18-fight-lab-tips-design.md`.

**Architecture:** React + Vite SPA on GitHub Pages, Supabase (Postgres) for data + auth, YouTube for video hosting. Mirrors the conventions already proven in the sibling `fight-lab-trainer` repo (same owner, same stack) — `AuthProvider`/`useUser` context, `RequireAuth` route guard, Tailwind v4, gh-pages deploy — but is a fully separate repo, Supabase project, and (dark, red-accented) visual identity.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4, react-router-dom v7, @supabase/supabase-js, lucide-react, Vitest + React Testing Library.

---

## Notes before starting

- **This repo does not exist yet** beyond `docs/` and `git init` — every file in Task 1 is new.
- **Testing scope:** pure functions (status derivation, filtering), data-access functions, and component rendering/interaction are all unit-tested (TDD, per steps below). In-app video recording (`MediaRecorder` + camera + native Share sheet) is real browser hardware/OS integration that jsdom cannot meaningfully simulate — faking it with mocks would test the mock, not the behavior. Task 14 documents a manual QA checklist for that piece instead of a fake automated test.
- **Security-critical deviation from the trainer app's Login page:** the trainer app's `Login.jsx` has a public sign-up toggle. This app's RLS policies (Task 2) grant full read/write to *any* authenticated user — there is no per-owner row scoping, because this is explicitly a single-user app. That means a public sign-up form here would let a stranger self-register and get full access to the data. Task 4's login page is **sign-in only**; the one account is created once, directly in the Supabase dashboard (Task 2), never through app UI.

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `public/404.html`
- Create: `public/favicon.svg`
- Create: `.gitignore`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Create: `src/setupTests.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "fight-lab-tips",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "deploy": "vite build && gh-pages -d dist"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.108.2",
    "lucide-react": "^1.21.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "gh-pages": "^6.3.0",
    "jsdom": "^25.0.1",
    "oxlint": "^1.69.0",
    "tailwindcss": "^4.3.1",
    "vite": "^8.1.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/fight-lab-tips/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 3: Create `src/setupTests.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fight Lab טיפס</title>
    <script>
      (function(l) {
        if (l.search[1] === '/') {
          var decoded = l.search.slice(1).split('&').map(function(s) {
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
        }
      }(window.location))
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `public/404.html`** (GitHub Pages SPA routing redirect — identical pattern to the trainer app)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    var l = window.location;
    l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 2).join('/') +
      '/?p=/' + l.pathname.slice(1).split('/').slice(1).join('/').replace(/&/g, '~and~') +
      (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash);
  </script>
</head>
</html>
```

- [ ] **Step 6: Create `public/favicon.svg`** (enso-ring mark, matches the app's brand)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="11" fill="none" stroke="#c7171a" stroke-width="4"
    stroke-dasharray="60 9" transform="rotate(-35 16 16)" />
</svg>
```

- [ ] **Step 7: Create `.gitignore`**

```
logs
*.log
node_modules
dist
dist-ssr
*.local
.env.local

.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
```

- [ ] **Step 8: Create `src/index.css`**

```css
@import "tailwindcss";

:root {
  --brand: #c7171a;
}

body {
  margin: 0;
  font-family: system-ui, 'Segoe UI', sans-serif;
  background: #0f0f0f;
  color: #f5f2f1;
}

#root {
  min-height: 100svh;
}
```

- [ ] **Step 9: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Install dependencies**

Run: `npm install`
Expected: installs with no errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 11: Verify the empty app runs**

Run: `npm run dev`
Expected: Vite dev server starts (e.g. `http://localhost:5173/`). Loading it shows a blank dark page with no console errors (App.jsx doesn't exist yet, so this step is really just confirming the toolchain — skip opening a browser if `App.jsx` isn't created yet; instead run `npm run build` and expect it to fail with "Could not resolve ./App.jsx", confirming Vite itself is wired correctly before App exists).

Run: `npm run build`
Expected: FAIL with `Could not resolve "./App.jsx"` — confirms Vite/Tailwind toolchain is working; App.jsx comes in Task 4.

- [ ] **Step 12: Commit**

```bash
git add package.json vite.config.js index.html public/404.html public/favicon.svg .gitignore src/index.css src/main.jsx src/setupTests.js package-lock.json
git commit -m "Scaffold Vite + React + Tailwind + Vitest project"
```

---

### Task 2: Supabase project setup

**Files:**
- Create: `supabase/schema.sql`
- Create: `.env.example`

This task is manual setup Yaniv does himself in the browser, walked through step by step. Nothing here is app code yet.

- [ ] **Step 1: Create the Supabase project**

Go to [supabase.com](https://supabase.com), sign in with the same account used for Fight Lab Trainer. Click **New Project**. Name it `fight-lab-tips` (a new, separate project — not the trainer app's project, so the two apps' data never mix). Pick the same region as the trainer project. Save the generated database password somewhere safe.

- [ ] **Step 2: Create `supabase/schema.sql`**

```sql
-- Fight Lab Tips schema. Run this once in the Supabase SQL Editor
-- (Project → SQL Editor → New query → paste this → Run).

create extension if not exists pgcrypto;

create table public.tips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  tags text[] not null default '{}',
  youtube_url text,
  note text,
  date_added timestamptz not null default now(),
  date_filmed timestamptz
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  tip_id uuid not null references public.tips(id) on delete cascade,
  platform text not null check (platform in ('YouTube', 'Instagram', 'Facebook', 'TikTok')),
  published_date timestamptz not null default now(),
  post_url text
);

alter table public.tips enable row level security;
alter table public.publications enable row level security;

-- Single-user app: any authenticated session IS Yaniv's session, because
-- the app has no public sign-up form (see Task 4). "authenticated" is
-- therefore an equivalent, simpler check than scoping by an owner_id column.
create policy "authenticated read/write on tips"
  on public.tips
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "authenticated read/write on publications"
  on public.publications
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
```

- [ ] **Step 3: Run the schema**

In the Supabase dashboard: **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, click **Run**. Expected: "Success. No rows returned." Then check **Table Editor** — `tips` and `publications` should both appear, each showing a lock icon (RLS enabled).

- [ ] **Step 4: Create Yaniv's one login**

**Authentication → Users → Add user → Create new user.** Enter an email and password. Check "Auto Confirm User" so no confirmation email step is needed. This is the *only* account that will ever exist — created here, directly in the dashboard, never through the app itself (Task 4's login screen has no sign-up option, on purpose).

- [ ] **Step 5: Collect the connection details**

**Project Settings → API.** Copy the **Project URL** and the **anon public** key (not the `service_role` key — that one must never be used in client-side code).

- [ ] **Step 6: Create `.env.example`** (committed — documents what's needed, holds no real secrets)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 7: Create the real `.env.local`** (not committed — already covered by `.gitignore` from Task 1)

```
VITE_SUPABASE_URL=<paste the Project URL from Step 5>
VITE_SUPABASE_ANON_KEY=<paste the anon public key from Step 5>
```

- [ ] **Step 8: Commit**

```bash
git add supabase/schema.sql .env.example
git commit -m "Add Supabase schema and RLS policies"
```

---

### Task 3: Supabase client and auth context

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/lib/AuthContext.jsx`
- Test: `src/lib/AuthContext.test.jsx`

- [ ] **Step 1: Create `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)
```

- [ ] **Step 2: Write the failing test for `AuthContext`**

```jsx
// src/lib/AuthContext.test.jsx
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/lib/AuthContext.test.jsx`
Expected: FAIL — `Failed to resolve import "./AuthContext"` (file doesn't exist yet).

- [ ] **Step 4: Create `src/lib/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useUser = () => useContext(AuthContext)
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/lib/AuthContext.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.js src/lib/AuthContext.jsx src/lib/AuthContext.test.jsx
git commit -m "Add Supabase client and auth context"
```

---

### Task 4: Login page and app routing shell

**Files:**
- Create: `src/pages/Login.jsx`
- Create: `src/pages/Login.test.jsx`
- Create: `src/App.jsx`

- [ ] **Step 1: Write the failing test for the sign-in-only login page**

```jsx
// src/pages/Login.test.jsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/Login.test.jsx`
Expected: FAIL — `Failed to resolve import "./Login"`.

- [ ] **Step 3: Create `src/pages/Login.jsx`** (sign-in only — no sign-up toggle, see the security note at the top of this plan)

```jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]" dir="rtl">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full border-2 border-[#c7171a] border-r-transparent rotate-[-35deg]" />
          <div>
            <div className="text-white font-bold text-lg leading-tight">Fight Lab</div>
            <div className="text-gray-400 text-sm">טיפס</div>
          </div>
        </div>

        <h1 className="text-white text-xl font-semibold mb-6">כניסה</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-[#c7171a] placeholder:text-gray-500"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-700 focus:border-[#c7171a] placeholder:text-gray-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#c7171a] text-white font-semibold rounded-lg py-3 hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'טוען...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/pages/Login.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/App.jsx`** (routing shell — `BrowsePage`, `TipDetailPage`, `AddTipWizard` are placeholders until Tasks 11–13 create them; import paths are correct now so later tasks slot in without touching this file again)

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useUser } from './lib/AuthContext'
import Login from './pages/Login'
import BrowsePage from './pages/BrowsePage'
import TipDetailPage from './pages/TipDetailPage'
import AddTipWizard from './pages/AddTipWizard'

function RequireAuth({ children }) {
  const user = useUser()
  if (user === undefined) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">טוען...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const user = useUser()
  if (user === undefined) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">טוען...</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<RequireAuth><BrowsePage /></RequireAuth>} />
      <Route path="/tips/new" element={<RequireAuth><AddTipWizard /></RequireAuth>} />
      <Route path="/tips/:id" element={<RequireAuth><TipDetailPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/Login.jsx src/pages/Login.test.jsx src/App.jsx
git commit -m "Add sign-in-only login page and app routing shell"
```

---

### Task 5: Status derivation

**Files:**
- Create: `src/lib/tipStatus.js`
- Test: `src/lib/tipStatus.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/lib/tipStatus.test.js
import { describe, it, expect } from 'vitest'
import { deriveStatus } from './tipStatus'

describe('deriveStatus', () => {
  it('is "idea" when there is no youtube_url', () => {
    expect(deriveStatus({ youtube_url: null, publications: [] })).toBe('idea')
  })

  it('is "filmed" when youtube_url is set but there are no publications', () => {
    expect(deriveStatus({ youtube_url: 'https://youtu.be/abc', publications: [] })).toBe('filmed')
  })

  it('is "published" when youtube_url is set and there is at least one publication', () => {
    expect(deriveStatus({
      youtube_url: 'https://youtu.be/abc',
      publications: [{ platform: 'Instagram' }],
    })).toBe('published')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/tipStatus.test.js`
Expected: FAIL — `Failed to resolve import "./tipStatus"`.

- [ ] **Step 3: Create `src/lib/tipStatus.js`**

```js
export function deriveStatus(tip) {
  if (!tip.youtube_url) return 'idea'
  return tip.publications && tip.publications.length > 0 ? 'published' : 'filmed'
}

export const STATUS_LABELS = { idea: 'רעיון', filmed: 'צולם', published: 'פורסם' }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/tipStatus.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/tipStatus.js src/lib/tipStatus.test.js
git commit -m "Add derived tip status logic"
```

---

### Task 6: Tips data-access layer

**Files:**
- Create: `src/lib/tips.js`
- Test: `src/lib/tips.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/lib/tips.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTips, createTip, attachVideo, addPublication } from './tips'

const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()

vi.mock('./supabase', () => ({
  supabase: { from: (...args) => mockFrom(...args) },
}))

beforeEach(() => {
  mockSelect.mockReset(); mockOrder.mockReset(); mockInsert.mockReset()
  mockUpdate.mockReset(); mockEq.mockReset(); mockSingle.mockReset(); mockFrom.mockReset()
})

describe('fetchTips', () => {
  it('selects tips joined with their publications, newest first', async () => {
    mockOrder.mockResolvedValue({ data: [{ id: '1', title: 'קרוס פייס' }], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })

    const result = await fetchTips()

    expect(mockFrom).toHaveBeenCalledWith('tips')
    expect(mockSelect).toHaveBeenCalledWith('*, publications(*)')
    expect(mockOrder).toHaveBeenCalledWith('date_added', { ascending: false })
    expect(result).toEqual([{ id: '1', title: 'קרוס פייס' }])
  })

  it('throws when Supabase returns an error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('network down') })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })

    await expect(fetchTips()).rejects.toThrow('network down')
  })
})

describe('createTip', () => {
  it('inserts a new tip and returns it with its (empty) publications', async () => {
    mockSingle.mockResolvedValue({ data: { id: '2', title: 'קו המשווה' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const result = await createTip({ title: 'קו המשווה', category: 'עקרונות כלליים', tags: ['הרמות'], note: '' })

    expect(mockFrom).toHaveBeenCalledWith('tips')
    expect(mockInsert).toHaveBeenCalledWith({
      title: 'קו המשווה', category: 'עקרונות כלליים', tags: ['הרמות'], note: '', youtube_url: null,
    })
    expect(result).toEqual({ id: '2', title: 'קו המשווה' })
  })
})

describe('attachVideo', () => {
  it('sets youtube_url and date_filmed on the given tip', async () => {
    mockSingle.mockResolvedValue({ data: { id: '2', youtube_url: 'https://youtu.be/xyz' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    const result = await attachVideo('2', 'https://youtu.be/xyz')

    expect(mockFrom).toHaveBeenCalledWith('tips')
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ youtube_url: 'https://youtu.be/xyz' }))
    expect(mockEq).toHaveBeenCalledWith('id', '2')
    expect(result.youtube_url).toBe('https://youtu.be/xyz')
  })
})

describe('addPublication', () => {
  it('inserts a publication row scoped to the given tip', async () => {
    mockSingle.mockResolvedValue({ data: { id: '9', tip_id: '2', platform: 'Instagram' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const result = await addPublication('2', { platform: 'Instagram', postUrl: 'https://instagram.com/p/abc' })

    expect(mockFrom).toHaveBeenCalledWith('publications')
    expect(mockInsert).toHaveBeenCalledWith({ tip_id: '2', platform: 'Instagram', post_url: 'https://instagram.com/p/abc' })
    expect(result.platform).toBe('Instagram')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/tips.test.js`
Expected: FAIL — `Failed to resolve import "./tips"`.

- [ ] **Step 3: Create `src/lib/tips.js`**

```js
import { supabase } from './supabase'

export async function fetchTips() {
  const { data, error } = await supabase
    .from('tips')
    .select('*, publications(*)')
    .order('date_added', { ascending: false })
  if (error) throw error
  return data
}

export async function createTip({ title, category, tags, note, youtube_url = null }) {
  const { data, error } = await supabase
    .from('tips')
    .insert({ title, category, tags, note, youtube_url })
    .select('*, publications(*)')
    .single()
  if (error) throw error
  return data
}

export async function attachVideo(tipId, youtubeUrl) {
  const { data, error } = await supabase
    .from('tips')
    .update({ youtube_url: youtubeUrl, date_filmed: new Date().toISOString() })
    .eq('id', tipId)
    .select('*, publications(*)')
    .single()
  if (error) throw error
  return data
}

export async function addPublication(tipId, { platform, postUrl = null }) {
  const { data, error } = await supabase
    .from('publications')
    .insert({ tip_id: tipId, platform, post_url: postUrl })
    .select()
    .single()
  if (error) throw error
  return data
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/tips.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/tips.js src/lib/tips.test.js
git commit -m "Add Supabase data-access functions for tips and publications"
```

---

### Task 7: `useTips` hook with realtime updates

**Files:**
- Create: `src/hooks/useTips.js`
- Test: `src/hooks/useTips.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/hooks/useTips.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTips } from './useTips'

const mockFetchTips = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockChannel = vi.fn()
const mockRemoveChannel = vi.fn()

vi.mock('../lib/tips', () => ({ fetchTips: (...args) => mockFetchTips(...args) }))
vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: (...args) => mockChannel(...args),
    removeChannel: (...args) => mockRemoveChannel(...args),
  },
}))

function Probe() {
  const { tips, error } = useTips()
  if (error) return <div>error: {error.message}</div>
  if (tips === undefined) return <div>loading</div>
  return <div>{tips.length} tips</div>
}

describe('useTips', () => {
  beforeEach(() => {
    mockFetchTips.mockReset(); mockOn.mockReset(); mockSubscribe.mockReset()
    mockChannel.mockReset(); mockRemoveChannel.mockReset()
    mockOn.mockReturnValue({ on: mockOn, subscribe: mockSubscribe })
    mockChannel.mockReturnValue({ on: mockOn })
  })

  it('loads tips on mount', async () => {
    mockFetchTips.mockResolvedValue([{ id: '1' }, { id: '2' }])
    render(<Probe />)
    expect(screen.getByText('loading')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('2 tips')).toBeInTheDocument())
  })

  it('surfaces an error if fetching fails', async () => {
    mockFetchTips.mockRejectedValue(new Error('offline'))
    render(<Probe />)
    await waitFor(() => expect(screen.getByText('error: offline')).toBeInTheDocument())
  })

  it('subscribes to realtime changes on both tables', async () => {
    mockFetchTips.mockResolvedValue([])
    render(<Probe />)
    await waitFor(() => expect(mockChannel).toHaveBeenCalledWith('tips-changes'))
    expect(mockOn).toHaveBeenCalledWith('postgres_changes', { event: '*', schema: 'public', table: 'tips' }, expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('postgres_changes', { event: '*', schema: 'public', table: 'publications' }, expect.any(Function))
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/hooks/useTips.test.jsx`
Expected: FAIL — `Failed to resolve import "./useTips"`.

- [ ] **Step 3: Create `src/hooks/useTips.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchTips } from '../lib/tips'

export function useTips() {
  const [tips, setTips] = useState(undefined) // undefined = loading
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    fetchTips().then(setTips).catch(setError)
  }, [])

  useEffect(() => {
    reload()
    const channel = supabase
      .channel('tips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tips' }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'publications' }, reload)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [reload])

  return { tips, error, reload }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/hooks/useTips.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTips.js src/hooks/useTips.test.jsx
git commit -m "Add useTips hook with realtime subscription"
```

---

### Task 8: Filtering logic

**Files:**
- Create: `src/lib/filterTips.js`
- Test: `src/lib/filterTips.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/lib/filterTips.test.js
import { describe, it, expect } from 'vitest'
import { filterTips } from './filterTips'

const tips = [
  { id: '1', title: 'קרוס פייס', category: 'שליטה ולחץ', tags: ['סייד', 'מאונט'], youtube_url: 'x', publications: [{ platform: 'Instagram' }] },
  { id: '2', title: 'קצה מקל', category: 'שליטה ולחץ', tags: ['ארמבר'], youtube_url: 'x', publications: [] },
  { id: '3', title: 'מרפק מעל כתף', category: 'מצבים ומיקומים ספציפיים', tags: ['ארמבר'], youtube_url: null, publications: [] },
]

describe('filterTips', () => {
  it('returns everything when no filters are set', () => {
    expect(filterTips(tips)).toHaveLength(3)
  })

  it('filters by derived status', () => {
    expect(filterTips(tips, { status: 'idea' }).map(t => t.id)).toEqual(['3'])
    expect(filterTips(tips, { status: 'filmed' }).map(t => t.id)).toEqual(['2'])
    expect(filterTips(tips, { status: 'published' }).map(t => t.id)).toEqual(['1'])
  })

  it('filters by category (any of the selected categories)', () => {
    expect(filterTips(tips, { categories: ['מצבים ומיקומים ספציפיים'] }).map(t => t.id)).toEqual(['3'])
  })

  it('filters by tag (tip matches if it has any selected tag)', () => {
    expect(filterTips(tips, { tags: ['ארמבר'] }).map(t => t.id)).toEqual(['2', '3'])
  })

  it('filters by search text across title and tags, case-insensitively', () => {
    expect(filterTips(tips, { search: 'קרוס' }).map(t => t.id)).toEqual(['1'])
    expect(filterTips(tips, { search: 'ARMBAR' })).toHaveLength(0) // Hebrew tags, an English query matches nothing here
  })

  it('combines status, category, tag, and search filters together', () => {
    expect(filterTips(tips, { status: 'filmed', tags: ['ארמבר'] }).map(t => t.id)).toEqual(['2'])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/filterTips.test.js`
Expected: FAIL — `Failed to resolve import "./filterTips"`.

- [ ] **Step 3: Create `src/lib/filterTips.js`**

```js
import { deriveStatus } from './tipStatus'

export function filterTips(tips, { search = '', status = null, categories = [], tags = [] } = {}) {
  return tips.filter(tip => {
    if (status && deriveStatus(tip) !== status) return false
    if (categories.length > 0 && !categories.includes(tip.category)) return false
    if (tags.length > 0 && !tags.some(t => tip.tags.includes(t))) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const haystack = `${tip.title} ${tip.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/filterTips.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/filterTips.js src/lib/filterTips.test.js
git commit -m "Add tip filtering logic"
```

---

### Task 9: `StatusBadge` component

**Files:**
- Create: `src/components/StatusBadge.jsx`
- Test: `src/components/StatusBadge.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/StatusBadge.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['idea', 'רעיון'],
    ['filmed', 'צולם'],
    ['published', 'פורסם'],
  ])('renders the Hebrew label for status "%s"', (status, label) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/StatusBadge.test.jsx`
Expected: FAIL — `Failed to resolve import "./StatusBadge"`.

- [ ] **Step 3: Create `src/components/StatusBadge.jsx`**

```jsx
import { STATUS_LABELS } from '../lib/tipStatus'

const DOT_STYLES = {
  idea: 'border border-gray-400',
  filmed: 'bg-gray-900',
  published: 'bg-white',
}

const BADGE_STYLES = {
  idea: 'border border-gray-500 text-gray-400',
  filmed: 'bg-white text-gray-900',
  published: 'bg-[#c7171a] text-white',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold text-[10px] px-2 py-1 rounded-full ${BADGE_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/StatusBadge.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/StatusBadge.jsx src/components/StatusBadge.test.jsx
git commit -m "Add StatusBadge component"
```

---

### Task 10: `FilterBar` component — status and category/tags as separate groups

**Files:**
- Create: `src/components/FilterBar.jsx`
- Test: `src/components/FilterBar.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/FilterBar.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'

function setup(overrides = {}) {
  const props = {
    status: null,
    onStatusChange: vi.fn(),
    allCategories: ['שליטה ולחץ'],
    allTags: ['ארמבר', 'סייד'],
    selectedCategories: [],
    onToggleCategory: vi.fn(),
    selectedTags: [],
    onToggleTag: vi.fn(),
    ...overrides,
  }
  render(<FilterBar {...props} />)
  return props
}

describe('FilterBar', () => {
  it('renders status and category/tag filters as two separately labeled groups', () => {
    setup()
    expect(screen.getByText('מצב')).toBeInTheDocument()
    expect(screen.getByText('קטגוריה ותגיות')).toBeInTheDocument()
  })

  it('calls onStatusChange with the selected status', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'פורסם' }))
    expect(props.onStatusChange).toHaveBeenCalledWith('published')
  })

  it('calls onToggleCategory when a category chip is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'שליטה ולחץ' }))
    expect(props.onToggleCategory).toHaveBeenCalledWith('שליטה ולחץ')
  })

  it('calls onToggleTag when a tag chip is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'ארמבר' }))
    expect(props.onToggleTag).toHaveBeenCalledWith('ארמבר')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/FilterBar.test.jsx`
Expected: FAIL — `Failed to resolve import "./FilterBar"`.

- [ ] **Step 3: Create `src/components/FilterBar.jsx`**

```jsx
const STATUS_OPTIONS = [
  { value: null, label: 'הכל' },
  { value: 'idea', label: 'רעיון' },
  { value: 'filmed', label: 'צולם' },
  { value: 'published', label: 'פורסם' },
]

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border ${
        active ? 'bg-[#c7171a] border-[#c7171a] text-white' : 'border-gray-700 text-gray-400'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterBar({
  status, onStatusChange,
  allCategories, allTags,
  selectedCategories, onToggleCategory,
  selectedTags, onToggleTag,
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-3" dir="rtl">
      <div>
        <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">מצב</div>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map(opt => (
            <Chip key={opt.label} active={status === opt.value} onClick={() => onStatusChange(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800" />

      <div>
        <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">קטגוריה ותגיות</div>
        <div className="flex gap-1.5 overflow-x-auto flex-wrap">
          {allCategories.map(cat => (
            <Chip key={cat} active={selectedCategories.includes(cat)} onClick={() => onToggleCategory(cat)}>
              {cat}
            </Chip>
          ))}
          {allTags.map(tag => (
            <Chip key={tag} active={selectedTags.includes(tag)} onClick={() => onToggleTag(tag)}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/FilterBar.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.jsx src/components/FilterBar.test.jsx
git commit -m "Add FilterBar with separate status and category/tag groups"
```

---

### Task 11: `TipCard` and `BrowsePage`

**Files:**
- Create: `src/components/TipCard.jsx`
- Create: `src/components/TipCard.test.jsx`
- Create: `src/pages/BrowsePage.jsx`
- Create: `src/pages/BrowsePage.test.jsx`

- [ ] **Step 1: Write the failing test for `TipCard`**

```jsx
// src/components/TipCard.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import TipCard from './TipCard'

function renderCard(tip) {
  return render(<MemoryRouter><TipCard tip={tip} /></MemoryRouter>)
}

describe('TipCard', () => {
  it('links to the tip detail page', () => {
    renderCard({ id: '42', title: 'קרוס פייס', youtube_url: 'x', publications: [] })
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tips/42')
  })

  it('shows the title and derived status', () => {
    renderCard({ id: '1', title: 'קרוס פייס', youtube_url: null, publications: [] })
    expect(screen.getByText('קרוס פייס')).toBeInTheDocument()
    expect(screen.getByText('רעיון')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/TipCard.test.jsx`
Expected: FAIL — `Failed to resolve import "./TipCard"`.

- [ ] **Step 3: Create `src/components/TipCard.jsx`**

```jsx
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { deriveStatus } from '../lib/tipStatus'

export default function TipCard({ tip }) {
  const status = deriveStatus(tip)
  return (
    <Link to={`/tips/${tip.id}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden block">
      {status === 'idea' ? (
        <div className="m-1.5 h-16 rounded-lg border border-dashed border-gray-700" />
      ) : (
        <div className="h-20 bg-gray-800 flex items-center justify-center">
          <Play className="w-4 h-4 text-gray-200" fill="currentColor" />
        </div>
      )}
      <div className="p-2.5">
        <div className="text-sm font-semibold text-white mb-1 truncate">{tip.title}</div>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/TipCard.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing test for `BrowsePage`**

```jsx
// src/pages/BrowsePage.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BrowsePage from './BrowsePage'

const mockUseTips = vi.fn()
vi.mock('../hooks/useTips', () => ({ useTips: () => mockUseTips() }))

const TIPS = [
  { id: '1', title: 'קרוס פייס', category: 'שליטה ולחץ', tags: ['סייד'], youtube_url: 'x', note: '', publications: [{ platform: 'Instagram' }] },
  { id: '2', title: 'מרפק מעל כתף', category: 'מצבים ומיקומים ספציפיים', tags: ['ארמבר'], youtube_url: null, note: '', publications: [] },
]

describe('BrowsePage', () => {
  beforeEach(() => mockUseTips.mockReturnValue({ tips: TIPS, error: null }))

  it('shows a loading state while tips are undefined', () => {
    mockUseTips.mockReturnValue({ tips: undefined, error: null })
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    expect(screen.getByText('טוען...')).toBeInTheDocument()
  })

  it('renders a card for every tip', () => {
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    expect(screen.getByText('קרוס פייס')).toBeInTheDocument()
    expect(screen.getByText('מרפק מעל כתף')).toBeInTheDocument()
  })

  it('filters the grid when a status chip is clicked', async () => {
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'רעיון' }))
    expect(screen.queryByText('קרוס פייס')).not.toBeInTheDocument()
    expect(screen.getByText('מרפק מעל כתף')).toBeInTheDocument()
  })

  it('filters the grid by search text', async () => {
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText(/חיפוש/), 'מרפק')
    expect(screen.queryByText('קרוס פייס')).not.toBeInTheDocument()
    expect(screen.getByText('מרפק מעל כתף')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run src/pages/BrowsePage.test.jsx`
Expected: FAIL — `Failed to resolve import "./BrowsePage"`.

- [ ] **Step 7: Create `src/pages/BrowsePage.jsx`**

```jsx
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTips } from '../hooks/useTips'
import { filterTips } from '../lib/filterTips'
import FilterBar from '../components/FilterBar'
import TipCard from '../components/TipCard'

export default function BrowsePage() {
  const { tips, error } = useTips()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const allCategories = useMemo(
    () => tips ? [...new Set(tips.map(t => t.category))] : [],
    [tips],
  )
  const allTags = useMemo(
    () => tips ? [...new Set(tips.flatMap(t => t.tags))] : [],
    [tips],
  )

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  if (error) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400">שגיאה: {error.message}</div>
  if (tips === undefined) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">טוען...</div>

  const visible = filterTips(tips, { search, status, categories: selectedCategories, tags: selectedTags })

  return (
    <div className="min-h-screen bg-[#0f0f0f]" dir="rtl">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#c7171a] border-r-transparent rotate-[-35deg]" />
          <span className="text-white font-bold">Fight Lab טיפס</span>
        </div>
        <Link to="/tips/new" className="bg-[#c7171a] text-white rounded-full p-2">
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      <input
        placeholder="חיפוש לפי שם או תג טכניקה..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mx-4 mb-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
        style={{ width: 'calc(100% - 2rem)' }}
      />

      <FilterBar
        status={status}
        onStatusChange={setStatus}
        allCategories={allCategories}
        allTags={allTags}
        selectedCategories={selectedCategories}
        onToggleCategory={cat => toggle(selectedCategories, setSelectedCategories, cat)}
        selectedTags={selectedTags}
        onToggleTag={tag => toggle(selectedTags, setSelectedTags, tag)}
      />

      <div className="grid grid-cols-2 gap-2.5 px-4 pb-6">
        {visible.map(tip => <TipCard key={tip.id} tip={tip} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/pages/BrowsePage.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/TipCard.jsx src/components/TipCard.test.jsx src/pages/BrowsePage.jsx src/pages/BrowsePage.test.jsx
git commit -m "Add TipCard and BrowsePage with search and two-group filtering"
```

---

### Task 12: `TipDetailPage`

**Files:**
- Create: `src/pages/TipDetailPage.jsx`
- Create: `src/pages/TipDetailPage.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/TipDetailPage.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TipDetailPage from './TipDetailPage'

const mockUseTips = vi.fn()
const mockAttachVideo = vi.fn()
const mockAddPublication = vi.fn()

vi.mock('../hooks/useTips', () => ({ useTips: () => mockUseTips() }))
vi.mock('../lib/tips', () => ({
  attachVideo: (...args) => mockAttachVideo(...args),
  addPublication: (...args) => mockAddPublication(...args),
}))

function renderAt(id, tips) {
  mockUseTips.mockReturnValue({ tips, error: null, reload: vi.fn() })
  return render(
    <MemoryRouter initialEntries={[`/tips/${id}`]}>
      <Routes><Route path="/tips/:id" element={<TipDetailPage />} /></Routes>
    </MemoryRouter>,
  )
}

const IDEA_TIP = { id: '1', title: 'מרפק מעל כתף', category: 'מצבים', tags: ['ארמבר'], youtube_url: null, note: 'הערה', publications: [] }
const FILMED_TIP = { id: '2', title: 'קצה מקל', category: 'שליטה ולחץ', tags: ['ארמבר'], youtube_url: 'https://youtu.be/x', note: '', publications: [] }
const PUBLISHED_TIP = {
  id: '3', title: 'קרוס פייס', category: 'שליטה ולחץ', tags: ['סייד'], youtube_url: 'https://youtu.be/y', note: '',
  publications: [{ id: 'p1', platform: 'Instagram', published_date: '2026-07-12T00:00:00Z', post_url: null }],
}

describe('TipDetailPage', () => {
  beforeEach(() => { mockAttachVideo.mockReset(); mockAddPublication.mockReset() })

  it('shows "mark as filmed" only for idea-status tips', () => {
    renderAt('1', [IDEA_TIP])
    expect(screen.getByRole('button', { name: /סמן כצולם/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /רשום פרסום/ })).not.toBeInTheDocument()
  })

  it('shows "log a publish" for filmed and published tips, not "mark as filmed"', () => {
    renderAt('2', [FILMED_TIP])
    expect(screen.queryByRole('button', { name: /סמן כצולם/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /רשום פרסום/ })).toBeInTheDocument()
  })

  it('shows publication history for published tips', () => {
    renderAt('3', [PUBLISHED_TIP])
    expect(screen.getByText('Instagram')).toBeInTheDocument()
  })

  it('calls attachVideo with the pasted link when marking an idea as filmed', async () => {
    mockAttachVideo.mockResolvedValue({ ...IDEA_TIP, youtube_url: 'https://youtu.be/new' })
    renderAt('1', [IDEA_TIP])
    await userEvent.click(screen.getByRole('button', { name: /סמן כצולם/ }))
    await userEvent.type(screen.getByPlaceholderText(/קישור/), 'https://youtu.be/new')
    await userEvent.click(screen.getByRole('button', { name: /שמור קישור/ }))
    expect(mockAttachVideo).toHaveBeenCalledWith('1', 'https://youtu.be/new')
  })

  it('calls addPublication with the chosen platform when logging a publish', async () => {
    mockAddPublication.mockResolvedValue({ id: 'p2', platform: 'TikTok' })
    renderAt('2', [FILMED_TIP])
    await userEvent.click(screen.getByRole('button', { name: /רשום פרסום/ }))
    await userEvent.click(screen.getByRole('button', { name: 'TikTok' }))
    expect(mockAddPublication).toHaveBeenCalledWith('2', { platform: 'TikTok', postUrl: null })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/TipDetailPage.test.jsx`
Expected: FAIL — `Failed to resolve import "./TipDetailPage"`.

- [ ] **Step 3: Create `src/pages/TipDetailPage.jsx`**

```jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTips } from '../hooks/useTips'
import { attachVideo, addPublication } from '../lib/tips'
import { deriveStatus, STATUS_LABELS } from '../lib/tipStatus'

const PLATFORMS = ['YouTube', 'Instagram', 'Facebook', 'TikTok']

export default function TipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tips, reload } = useTips()
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [showPublishForm, setShowPublishForm] = useState(false)

  if (tips === undefined) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">טוען...</div>

  const tip = tips.find(t => t.id === id)
  if (!tip) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">הטיפ לא נמצא</div>

  const status = deriveStatus(tip)

  async function handleSaveVideo() {
    await attachVideo(tip.id, videoUrl)
    setShowVideoForm(false)
    setVideoUrl('')
    reload()
  }

  async function handleLogPublish(platform) {
    await addPublication(tip.id, { platform, postUrl: null })
    setShowPublishForm(false)
    reload()
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" dir="rtl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 pt-4 pb-2 text-gray-400 text-sm">
        <ArrowRight className="w-4 h-4" /> חזרה לרשימה
      </button>

      {tip.youtube_url && (
        <div className="mx-4 aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
          <iframe
            className="w-full h-full"
            src={tip.youtube_url.replace('watch?v=', 'embed/')}
            title={tip.title}
            allowFullScreen
          />
        </div>
      )}

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">{tip.title}</h1>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#c7171a]">{STATUS_LABELS[status]}</span>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {tip.tags.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">{tag}</span>
          ))}
        </div>

        {tip.note && <p className="text-sm text-gray-400 mb-5">{tip.note}</p>}

        {tip.publications.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">היסטוריית פרסום</div>
            {tip.publications.map(pub => (
              <div key={pub.id} className="flex justify-between py-2 border-t border-gray-800 text-sm">
                <span>{pub.platform}</span>
                <span className="text-gray-500">{new Date(pub.published_date).toLocaleDateString('he-IL')}</span>
              </div>
            ))}
          </div>
        )}

        {status === 'idea' && !showVideoForm && (
          <button onClick={() => setShowVideoForm(true)} className="w-full bg-[#c7171a] font-semibold rounded-lg py-3">
            סמן כצולם
          </button>
        )}

        {showVideoForm && (
          <div className="flex flex-col gap-2">
            <input
              placeholder="הדבק קישור YouTube"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <button onClick={handleSaveVideo} className="bg-[#c7171a] font-semibold rounded-lg py-3">שמור קישור</button>
          </div>
        )}

        {status !== 'idea' && !showPublishForm && (
          <button onClick={() => setShowPublishForm(true)} className="w-full bg-[#c7171a] font-semibold rounded-lg py-3">
            רשום פרסום נוסף
          </button>
        )}

        {showPublishForm && (
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map(platform => (
              <button
                key={platform}
                onClick={() => handleLogPublish(platform)}
                className="border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {platform}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/pages/TipDetailPage.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/TipDetailPage.jsx src/pages/TipDetailPage.test.jsx
git commit -m "Add TipDetailPage with mark-as-filmed and log-a-publish actions"
```

---

### Task 13: `AddTipWizard` — steps 2 and 3 (title/category, tags/note)

Building the wizard back-to-front (steps 2 and 3 first) because they're pure form state with no browser-hardware dependency, unlike step 1's recording button (Task 14).

**Files:**
- Create: `src/pages/AddTipWizard.jsx`
- Create: `src/pages/AddTipWizard.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/AddTipWizard.test.jsx
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
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/pages/AddTipWizard.test.jsx`
Expected: FAIL — `Failed to resolve import "./AddTipWizard"`.

- [ ] **Step 3: Create `src/pages/AddTipWizard.jsx`** (step 1's recording button is a placeholder `<div>` here; Task 14 replaces it with `RecordButton` without touching this file's step/save logic)

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTip, attachVideo } from '../lib/tips'

export default function AddTipWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [note, setNote] = useState('')

  async function handleSave() {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const tip = await createTip({ title, category, tags, note, youtube_url: youtubeUrl || null })
    navigate(`/tips/${tip.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" dir="rtl">
      <div className="px-4 pt-4">
        <div className="font-bold mb-1">טיפ חדש</div>

        {step === 1 && (
          <>
            <div className="text-xs text-gray-500 mb-4">שלב 1 מתוך 3 · וידאו</div>
            {/* RecordButton slots in here in Task 14 */}
            <div className="text-xs text-gray-500 mb-3">ההקלטה תישלח דרך שיתוף אל אפליקציית YouTube להעלאה</div>
            <div className="text-xs text-gray-500 mb-1.5">או הדבק קישור YouTube קיים</div>
            <input
              placeholder="הדבק קישור..."
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-4 placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">דלג</button>
              <button onClick={() => setStep(2)} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold">הבא</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-xs text-gray-500 mb-4">שלב 2 מתוך 3 · שם וקטגוריה</div>
            <input
              placeholder="לדוגמה: קרוס פייס"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-3 placeholder:text-gray-500"
            />
            <input
              placeholder="קטגוריה"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-4 placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">חזרה</button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold">הבא</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-xs text-gray-500 mb-4">שלב 3 מתוך 3 · תגיות והערה</div>
            <input
              placeholder="תגי טכניקות (מופרדות בפסיק)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-3 placeholder:text-gray-500"
            />
            <input
              placeholder="הערה קצרה"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-4 placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">חזרה</button>
              <button onClick={handleSave} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold">שמור</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/pages/AddTipWizard.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/AddTipWizard.jsx src/pages/AddTipWizard.test.jsx
git commit -m "Add AddTipWizard steps 2 and 3, and idea/link/skip handling for step 1"
```

---

### Task 14: In-app recording (`RecordButton`)

**Files:**
- Create: `src/components/RecordButton.jsx`
- Modify: `src/pages/AddTipWizard.jsx` (swap the step-1 placeholder comment for `<RecordButton />`)

This is real browser hardware/OS integration (`getUserMedia`, `MediaRecorder`, the Web Share API). jsdom has no camera, no encoder, and no OS share sheet — a mocked "test" of this would only prove the mocks were called, not that recording or sharing actually works. So this task ships the real implementation plus a **manual QA checklist** run on Yaniv's actual phone (Task 15 folds this into final testing), rather than a fake automated test.

- [ ] **Step 1: Create `src/components/RecordButton.jsx`**

```jsx
import { useRef, useState } from 'react'
import { Circle } from 'lucide-react'

function pickMimeType() {
  const candidates = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm']
  return candidates.find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) ?? ''
}

export default function RecordButton() {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  async function start() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = handleStop
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setError('לא ניתן לגשת למצלמה. ודא שהאפליקציה קיבלה הרשאת מצלמה בדפדפן.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setRecording(false)
  }

  async function handleStop() {
    const mimeType = recorderRef.current?.mimeType || 'video/webm'
    const blob = new Blob(chunksRef.current, { type: mimeType })
    const file = new File([blob], `fight-lab-tip-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`, { type: mimeType })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Fight Lab clip' })
      } catch {
        // user cancelled the share sheet — nothing to do, the clip stays local to this session
      }
    } else {
      setError('שיתוף קבצים אינו נתמך בדפדפן זה. פתח את היוטיוב והעלה את הסרטון משם.')
    }
  }

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={recording ? stop : start}
        className="w-full flex items-center justify-center gap-2 bg-[#c7171a] rounded-lg py-3 font-semibold"
      >
        <Circle className="w-3 h-3" fill="currentColor" />
        {recording ? 'עצור הקלטה' : 'הקלט עכשיו'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Modify `src/pages/AddTipWizard.jsx`** — replace the step-1 placeholder

Change:
```jsx
            {/* RecordButton slots in here in Task 14 */}
```
To:
```jsx
            <RecordButton />
```

And add the import at the top of the file:
```jsx
import RecordButton from '../components/RecordButton'
```

- [ ] **Step 3: Run the full test suite to confirm nothing else broke**

Run: `npm test`
Expected: PASS — all suites from Tasks 3–13 still green (`RecordButton` itself has no automated test, per the rationale above).

- [ ] **Step 4: Manual QA on Yaniv's phone** (do this now, not deferred to Task 15, since it's the only verification this feature gets)

1. Run `npm run dev`, open the printed network URL on the S23 Ultra (same wifi network).
2. Go to step 1 of the add-tip wizard, tap "הקלט עכשיו" — browser should prompt for camera/microphone permission.
3. Grant permission, confirm the button changes to "עצור הקלטה".
4. Record a few seconds, tap "עצור הקלטה" — the phone's native Share sheet should appear.
5. Choose YouTube from the share sheet, confirm the clip opens in the YouTube upload flow.
6. If the share sheet doesn't appear: check the error message shown in the app, and confirm `navigator.canShare` support for files on the phone's Chrome version (Task/edge case already documented in the spec).

- [ ] **Step 5: Commit**

```bash
git add src/components/RecordButton.jsx src/pages/AddTipWizard.jsx
git commit -m "Add in-app recording with Share-sheet handoff to YouTube"
```

---

### Task 15: Deploy and final smoke test

**Files:**
- Modify: none (verification + deployment only)

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`
Expected: PASS — every suite from Tasks 3–13.

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: no errors (fix any that appear before continuing).

- [ ] **Step 3: Build for production**

Run: `npm run build`
Expected: succeeds, produces `dist/`.

- [ ] **Step 4: Create the GitHub repo and push**

```bash
gh repo create fight-lab-tips --private --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 5: Deploy to GitHub Pages**

Run: `npm run deploy`
Expected: builds and pushes `dist/` to the `gh-pages` branch. Then in the GitHub repo settings, confirm Pages is serving from the `gh-pages` branch — the app will be live at `https://<username>.github.io/fight-lab-tips/`.

- [ ] **Step 6: Full manual walkthrough on the live URL, on Yaniv's phone**

1. Open the live URL — should redirect to `/login`.
2. Sign in with the account created in Task 2, Step 4.
3. Confirm the browse screen loads empty (no tips yet).
4. Tap **+**, go through the add-tip wizard: skip video, enter a title/category from the original topic list (e.g. קרוס פייס / שליטה ולחץ), add tags, save.
5. Confirm the new tip appears on the browse screen as an **idea** (gray outline).
6. Open it, tap "סמן כצולם", paste any YouTube link, save — confirm it now shows as **filmed** (white).
7. Tap "רשום פרסום נוסף", pick a platform — confirm it now shows as **published** (red) and the publish shows up in the history list.
8. Test the status filter group and the category/tag filter group independently — confirm they combine correctly (e.g. status=filmed AND tag=ארמבר).
9. Test the record-now flow per Task 14 Step 4, end to end, on the live deployed URL (not just `localhost`).
10. Close the browser, reopen the URL — confirm the session persists (no need to log in again) and the tip data is still there (proves Supabase, not local state, is the source of truth).

- [ ] **Step 7: Seed the original topic list as ideas**

Using the app itself (not the database directly), add the remaining topics from the original doc as idea-only entries (title + category + tags, video skipped) — e.g. קו המשווה, זווית קטנה מ-90 מעלות, ישבנים על העקב, לחיצה על הסטרנום, שליטה מעל המרפק, כיוון הברך, ראש בבית שחי, Clamping בגארד. This is the real content backlog the spec called for, entered through the real UI as a final end-to-end confirmation that the whole pipeline works.

---

## Plan self-review

**Spec coverage:** Architecture (Task 1–3), data model + RLS (Task 2), derived status (Task 5), browse/filter with separated status vs. category/tag groups (Tasks 8, 10, 11), detail page with contextual actions and publish history (Task 12), 3-step add wizard including skippable video and in-app recording with Share-sheet handoff (Tasks 13–14), sign-in-only login matching the single-user RLS model (Task 4), deploy (Task 15). Phase 2 (engagement sync) and the rejected cross-posting/auto-upload features are explicitly out of scope per the spec's own phasing — no task implements them, correctly.

**Placeholder scan:** the only literal "placeholder" language is the intentional, temporary step-1 comment in Task 13 that Task 14 explicitly replaces with real code (`<RecordButton />`) — not a deferred TODO, a documented two-task handoff with exact before/after code shown in both tasks.

**Type/naming consistency:** `deriveStatus`, `filterTips`, `fetchTips`, `createTip`, `attachVideo`, `addPublication` are each defined once (Tasks 5, 6, 8) and called with matching signatures everywhere they're used later (Tasks 7, 11, 12, 13) — checked across all tasks.

---

Plan complete and saved to `docs/superpowers/plans/2026-07-18-fight-lab-tips-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
