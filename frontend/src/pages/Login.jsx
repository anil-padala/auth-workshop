import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import { validateCredentials } from '../utils/validation'

function Login({ onLogin, logoutSuccess, onLoginStart }) {
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const clientErrors = validateCredentials(values, false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setTouched((current) => ({ ...current, [name]: true }))
    setServerErrors((current) => ({ ...current, [name]: '' }))
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    onLoginStart?.()
    setTouched({ email: true, password: true })
    if (Object.keys(clientErrors).length > 0) return

    setIsSubmitting(true)
    setFormError('')
    setServerErrors({})
    try {
      await login(values)
      await onLogin()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const response = error.response?.data
      setServerErrors(response?.errors || {})
      setFormError(response?.message || 'Unable to sign in. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-main">
      <section className="auth-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in</h1>
        <p className="intro">Sign in to view your account report.</p>
        {logoutSuccess && (
          <p className="logout-success" role="status">
            {logoutSuccess}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(serverErrors.email || (touched.email && clientErrors.email))}
              aria-describedby={serverErrors.email || (touched.email && clientErrors.email) ? 'login-email-error' : undefined}
            />
            {(serverErrors.email || (touched.email && clientErrors.email)) && (
              <span className="field-error" id="login-email-error">
                {serverErrors.email || clientErrors.email}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={72}
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(serverErrors.password || (touched.password && clientErrors.password))}
              aria-describedby={serverErrors.password || (touched.password && clientErrors.password) ? 'login-password-error' : undefined}
            />
            {(serverErrors.password || (touched.password && clientErrors.password)) && (
              <span className="field-error" id="login-password-error">
                {serverErrors.password || clientErrors.password}
              </span>
            )}
          </div>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting || Object.keys(clientErrors).length > 0}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login