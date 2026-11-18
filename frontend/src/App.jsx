import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import { getSession, logout } from './services/authService'

function App() {
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [logoutSuccess, setLogoutSuccess] = useState('')

  useEffect(() => {
    let active = true

    getSession()
      .then((data) => {
        if (active) {
          setSession({
            user: data.user,
            expiresAt: Date.now() + data.expiresIn * 1000,
          })
        }
      })
      .catch((error) => {
        if (active && error.response?.status !== 401) {
          setSessionError('Unable to verify your session. Check the backend and retry.')
        }
      })
      .finally(() => {
        if (active) {
          setSessionLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const handleLogin = async () => {
    const data = await getSession()
    setSession({
      user: data.user,
      expiresAt: Date.now() + data.expiresIn * 1000,
    })
    setSessionError('')
    setLogoutSuccess('')
  }

  const handleLogout = async () => {
    await logout()
    setSession(null)
    setLogoutSuccess('Signed out successfully.')
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="site-header">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span>Auth Workshop</span>
          </Link>
          {session && <span className="signed-in">Signed in as {session.user.email}</span>}
        </header>

        {sessionError && <p className="notice" role="alert">{sessionError}</p>}

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <Login
                onLogin={handleLogin}
                logoutSuccess={logoutSuccess}
                onLoginStart={() => setLogoutSuccess('')}
              />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute session={session} loading={sessionLoading}>
                <Dashboard session={session} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
