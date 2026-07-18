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
