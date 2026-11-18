import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReportTable from '../components/ReportTable'
import { register } from '../services/authService'
import { validateCredentials } from '../utils/validation'

function Register() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const clientErrors = validateCredentials(values, true)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setTouched((current) => ({ ...current, [name]: true }))
    setServerErrors((current) => ({ ...current, [name]: '' }))
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched({ email: true, password: true })
    if (Object.keys(clientErrors).length > 0) return

    setIsSubmitting(true)
    setFormError('')
    setServerErrors({})
    try {
      const user = await register(values)
      setRegisteredUser(user)
    } catch (error) {
      const response = error.response?.data
      setServerErrors(response?.errors || {})
      setFormError(response?.message || 'Unable to create your account. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registeredUser) {
    return (
      <main className="page-main">
        <section className="auth-card success-card">
          <p className="eyebrow">REGISTRATION COMPLETE</p>
          <h1>Account created</h1>
          <p className="intro">Your safe account details are shown below.</p>
          <ReportTable
            title="Registration report"
            rows={[
              { label: 'Status', value: 'Created' },
              { label: 'User ID', value: registeredUser.id },
              { label: 'Email', value: registeredUser.email },
              { label: 'Created at', value: new Date(registeredUser.createdAt).toLocaleString() },
            ]}
          />
          <Link className="primary-button button-link" to="/login">Continue to sign in</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page-main">
      <section className="auth-card">
        <p className="eyebrow">GET STARTED</p>
        <h1>Create account</h1>
        <p className="intro">Your password is securely hashed before it is stored.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(serverErrors.email || (touched.email && clientErrors.email))}
              aria-describedby={serverErrors.email || (touched.email && clientErrors.email) ? 'register-email-error' : undefined}
            />
            {(serverErrors.email || (touched.email && clientErrors.email)) && (
              <span className="field-error" id="register-email-error">
                {serverErrors.email || clientErrors.email}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              maxLength={72}
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(serverErrors.password || (touched.password && clientErrors.password))}
              aria-describedby={serverErrors.password || (touched.password && clientErrors.password) ? 'register-password-error' : undefined}
            />
            <span className="field-hint">At least 8 characters, including a letter and a number.</span>
            {(serverErrors.password || (touched.password && clientErrors.password)) && (
              <span className="field-error" id="register-password-error">
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
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register