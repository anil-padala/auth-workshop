import { Navigate } from 'react-router-dom'

function ProtectedRoute({ session, loading, children }) {
  if (loading) {
    return (
      <main className="page-main">
        <p className="loading-message" role="status">Checking your session…</p>
      </main>
    )
  }

  return session ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute