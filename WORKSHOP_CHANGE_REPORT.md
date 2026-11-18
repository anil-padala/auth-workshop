# Auth Workshop - Change and Creation Report

## 1. Project Overview

This report documents the setup and implementation work completed for the Auth Workshop project.

- Repository: https://github.com/anil-padala/auth-workshop
- Local workspace: `C:\Users\DELL\auth-workshop`
- Frontend: React, React Router, Axios, and Vite
- Backend: Node.js, Express, bcrypt, JSON Web Tokens, and SQLite
- Database: `backend/auth.db`

## 2. Repository and Workspace Setup

The following setup activities were completed:

1. Created the public GitHub repository `auth-workshop`.
2. Cloned the repository into `C:\Users\DELL\auth-workshop`.
3. Created the `backend` and `frontend` folders.
4. Moved the existing React project into the frontend folder.
5. Verified Git, Node.js, npm, and the repository status.

## 3. Project Structure

```text
auth-workshop/
|-- README.md
|-- WORKSHOP_CHANGE_REPORT.md
|-- backend/
|   |-- .env
|   |-- auth.db
|   |-- server.js
|   |-- package.json
|   |-- package-lock.json
|   |-- controllers/
|   |   `-- authController.js
|   |-- database/
|   |   `-- db.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   `-- validation.js
|   |-- routes/
|   |   `-- authRoutes.js
|   `-- tests/
|       `-- auth.test.js
`-- frontend/
    |-- index.html
    |-- package.json
    |-- package-lock.json
    |-- vite.config.js
    |-- src/
    |   |-- App.jsx
    |   |-- App.css
    |   |-- index.css
    |   |-- main.jsx
    |   |-- components/
    |   |   |-- ProtectedRoute.jsx
    |   |   `-- ReportTable.jsx
    |   |-- pages/
    |   |   |-- Register.jsx
    |   |   |-- Login.jsx
    |   |   `-- Dashboard.jsx
    |   |-- services/
    |   |   `-- authService.js
    |   `-- utils/
    |       `-- validation.js
    `-- dist/
```

## 4. Backend Implementation

### Environment Configuration

The backend environment file contains:

```text
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
```

The example secret is for local workshop use only. It should be replaced with a high-entropy secret before production deployment.

### Backend Dependencies

The backend uses:

- `express`
- `bcrypt`
- `jsonwebtoken`
- `cors`
- `dotenv`
- `better-sqlite3`
- `jest`
- `supertest`

### Backend Files Created or Updated

- `backend/server.js`
- `backend/database/db.js`
- `backend/routes/authRoutes.js`
- `backend/controllers/authController.js`
- `backend/middleware/authMiddleware.js`
- `backend/middleware/validation.js`
- `backend/tests/auth.test.js`
- `backend/.env`
- `backend/package.json`
- `backend/package-lock.json`

### Database

The SQLite database was created at `backend/auth.db`.

The `users` table contains:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Backend Behavior

- Registration trims and normalizes email addresses.
- Passwords are validated and bcrypt-hashed.
- Duplicate emails return HTTP 409.
- Invalid registration fields return HTTP 400.
- Login validates credentials and returns a one-hour JWT.
- Login sets an HttpOnly, SameSite=Lax authentication cookie.
- Session endpoints verify the JWT and retrieve the current user.
- Logout clears the authentication cookie.

## 5. Frontend Implementation

### Frontend Dependencies

The frontend uses:

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `vite`
- `@vitejs/plugin-react`

### Frontend Files Created or Updated

- `frontend/src/App.jsx`
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/main.jsx`
- `frontend/src/services/authService.js`
- `frontend/src/utils/validation.js`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/components/ReportTable.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/index.html`
- `frontend/vite.config.js`
- `frontend/package.json`
- `frontend/package-lock.json`

### Frontend Behavior

- `Register.jsx` validates and submits new-account details.
- `Login.jsx` submits credentials and refreshes the session.
- `Dashboard.jsx` displays account and session information.
- `ProtectedRoute.jsx` prevents access to the dashboard without a valid session.
- `ReportTable.jsx` displays success and account information in tables.
- Registration and dashboard details are not displayed as raw JSON.

## 6. Page and API URLs

### Frontend URLs

| Page | URL |
|---|---|
| Login | http://localhost:5173/login |
| Register | http://localhost:5173/register |
| Dashboard | http://localhost:5173/dashboard |

### API URLs

| Method | URL | Purpose |
|---|---|---|
| GET | http://localhost:5000/api | API health message |
| POST | http://localhost:5000/api/register | Register a new user |
| POST | http://localhost:5000/api/login | Authenticate a user |
| GET | http://localhost:5000/api/session | Verify the current session |
| POST | http://localhost:5000/api/logout | Clear the authentication cookie |

## 7. Registration and Login Workflow

### Registration

1. The user opens `/register`.
2. The user enters an email and password.
3. Frontend validation checks the email and password requirements.
4. The frontend sends `POST /api/register`.
5. The backend normalizes the email.
6. The backend checks for an existing email.
7. The password is bcrypt-hashed.
8. The safe user information is returned and displayed in a report table.

### Login

1. The user opens `/login`.
2. The user enters an email and password.
3. The frontend sends `POST /api/login`.
4. The backend verifies the password.
5. A one-hour JWT is returned.
6. An HttpOnly authentication cookie is set.
7. The frontend retrieves `/api/session`.
8. The user is redirected to `/dashboard`.

### Logout

1. The user selects **Sign out** from the dashboard.
2. The frontend calls `POST /api/logout`.
3. The backend expires the authentication cookie.
4. The frontend clears its session state.
5. The login page shows **Signed out successfully.**
6. The sign-out message is styled in red.

## 8. Unit Test Scenarios

The following Given / When / Then scenarios were added to `backend/tests/auth.test.js`.

| ID | Given | When | Then |
|---|---|---|---|
| 1 | A valid new email and password | Register is called | The user is created and the stored hash is not plaintext |
| 2 | An already-registered email | Register is called | Response is 409 and no duplicate is created |
| 3 | An invalid email or short password | Register is called | Response is 400 with field errors |
| 4 | A registered user and correct password | Login is called | A token and one-hour session are returned |
| 5 | A registered user and wrong password | Login is called | Response is 401 with a generic message |
| 6 | A stored bcrypt hash and correct password | Verification is called | Verification returns true |

Jest test names include:

- `GWT 1 - valid new email and password`
- `GWT 2 - already-registered email`
- `GWT 3 - invalid email or short password`
- `GWT 4 - registered user and correct password`
- `GWT 5 - registered user and wrong password`
- `GWT 6 - stored hash and correct password`

## 9. Verification Results

### Backend Tests

Command:

```powershell
cd C:\Users\DELL\auth-workshop\backend
npm test
```

Verified result:

- 1 test suite passed
- 6 tests passed

### Frontend Build

Command:

```powershell
cd C:\Users\DELL\auth-workshop\frontend
npm run build
```

Verified result:

- Vite build completed successfully
- Frontend production files were generated in `frontend/dist`

## 10. Word Report

The complete end-to-end Word document was created as:

```text
C:\Users\DELL\auth-workshop\Auth_Workshop_End_to_End_Documentation.docx
```

The document includes:

- Software and prerequisite information
- GitHub and local workspace setup
- Project structure
- Backend and frontend setup
- All source-code listings
- Authentication workflows
- API reference
- Run and verification procedures
- Six Given / When / Then test cases
- Security considerations
- Troubleshooting
- Workshop completion checklist

## 11. Sign-Out Message Change

The logout flow was updated so that it shows:

```text
Signed out successfully.
```

The message is:

- Displayed on the login page after logout
- Assigned `role="status"` for accessibility
- Styled with a red text and border
- Cleared when the user starts another login attempt

## 12. Local Run Commands

### Start the Backend

```powershell
cd C:\Users\DELL\auth-workshop\backend
npm start
```

Backend address:

```text
http://localhost:5000
```

### Start the Frontend

```powershell
cd C:\Users\DELL\auth-workshop\frontend
npm run dev
```

Frontend address:

```text
http://localhost:5173
```

## 13. Git Operations

Typical workflow:

```powershell
cd C:\Users\DELL\auth-workshop
git status
git add .
git commit -m "Update Auth Workshop implementation and documentation"
git push origin main
```

## 14. Security Notes

- Replace `JWT_SECRET` with a unique high-entropy value.
- Do not commit `.env` or `auth.db`.
- Use HTTPS in production.
- Add rate limiting and account lockout.
- Keep Node.js packages updated.
- Use a Secure cookie flag in production.
