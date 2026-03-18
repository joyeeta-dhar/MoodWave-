import axios from 'axios'
const baseUrlValue = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL: baseUrlValue.endsWith('/api') ? baseUrlValue : `${baseUrlValue}/api`,
  timeout: 30000,
})
export default api
