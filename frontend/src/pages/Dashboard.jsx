import { useState } from 'react'
import ReportTable from '../components/ReportTable'

function Dashboard({ session, onLogout }) {
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, expiresAt } = session

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError('')
    try {
      await onLogout()
    } catch {
      setLogoutError('Unable to sign out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="page-main">
      <section className="dashboard-card">
        <p className="eyebrow">PROTECTED AREA</p>
        <h1>Account report</h1>
        <p className="intro">You are signed in. Your account information is displayed below.</p>
        <ReportTable
          title="Authenticated user"
          rows={[
            { label: 'Status', value: 'Authenticated' },
            { label: 'User ID', value: user.id },
            { label: 'Email', value: user.email },
            { label: 'Account created', value: new Date(user.createdAt).toLocaleString() },
            { label: 'Session expires', value: new Date(expiresAt).toLocaleString() },
          ]}
        />
        {logoutError && <p className="form-error" role="alert">{logoutError}</p>}
        <button
          className="secondary-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </main>
  )
}

export default Dashboard