const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCredentials({ email, password }, isRegistration) {
  const errors = {}
  const normalizedEmail = typeof email === 'string' ? email.trim() : ''

  if (!normalizedEmail) {
    errors.email = 'Email is required.'
  } else if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Enter a valid email address.'
  }

  if (typeof password !== 'string' || password.length === 0) {
    errors.password = 'Password is required.'
  } else if (new TextEncoder().encode(password).length > 72) {
    errors.password = 'Password must be no more than 72 bytes.'
  } else if (isRegistration && password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (isRegistration && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) {
    errors.password = 'Password must contain at least one letter and one number.'
  }

  return errors
}
