import { api, tokenStorage } from '@/shared/api/client'

export const authApi = {
  async login(data: { email: string; password: string }) {
    const { token } = await api.post<{ token: string }>('/sessions', data)
    tokenStorage.set(token)
  },
  async register(data: { name: string; email: string; password: string }) {
    await api.post('/users', data)
    await authApi.login({ email: data.email, password: data.password })
  },
  logout() {
    tokenStorage.clear()
  },
  isAuthenticated() {
    return Boolean(tokenStorage.get())
  },
}
