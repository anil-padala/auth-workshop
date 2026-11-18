import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

export async function register(credentials) {
  const response = await api.post('/register', credentials)
  return response.data
}

export async function login(credentials) {
  const response = await api.post('/login', credentials)
  return response.data
}

export async function getSession() {
  const response = await api.get('/session')
  return response.data
}

export async function logout() {
  const response = await api.post('/logout')
  return response.data
}