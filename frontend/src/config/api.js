import axios from "axios"

// support both VITE_API_URL (current docs) and legacy VITE_BACKEND_URL from .env.example
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for all requests
})

// Add interceptor
export const attachToken = (getToken) => {
  api.interceptors.request.use(async (config) => {
    const token = await getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}

export default api
