# Auth Workshop

## Run locally

- Backend: from `backend`, run `npm start` (or `node server.js`).
- Frontend: from `frontend`, run `npm run dev`, then open `http://localhost:5173`.

The frontend provides `/register`, `/login`, and a session-protected `/dashboard`.
Registration and dashboard success details are displayed as safe field/value
tables. The API remains JSON:

- `POST /api/register`
- `POST /api/login`
- `GET /api/session`
- `POST /api/logout`

The API normalizes emails, validates registration passwords, stores bcrypt
hashes, and returns validation errors by field. Login returns a one-hour JWT
and also sets it in an HttpOnly, SameSite=Lax cookie for the frontend session.
Use HTTPS in production; the cookie is marked Secure when `NODE_ENV=production`.
Set `JWT_SECRET` to a unique, high-entropy value outside version control.

## Operational security note

The login route performs a bcrypt comparison for unknown emails as well as
known users to reduce timing-based account discovery. Production deployments
should also add shared rate limiting or account lockout at the API gateway or
reverse proxy; the development server does not enforce a login attempt limit.