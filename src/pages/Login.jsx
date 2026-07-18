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
