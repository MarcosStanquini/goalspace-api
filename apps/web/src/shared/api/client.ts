// Em produção o front é servido pela própria API: mesma origem
const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:3333' : '')
const TOKEN_KEY = 'goalspace.token'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

let onUnauthorized = () => {}

// Registrado em main.tsx: sessão expirada limpa o cache e volta para o login
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function send(path: string, method: string, body?: unknown) {
  const token = tokenStorage.get()

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API.')
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      onUnauthorized()
    }

    const data = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      data?.message ?? 'Algo deu errado. Tente novamente.',
    )
  }

  return response
}

export const api = {
  async get<T>(path: string) {
    const response = await send(path, 'GET')
    return (await response.json()) as T
  },
  async post<T>(path: string, body?: unknown) {
    const response = await send(path, 'POST', body)
    return (response.status === 204 ? undefined : await response.json()) as T
  },
  async patch<T>(path: string, body: unknown) {
    const response = await send(path, 'PATCH', body)
    return (response.status === 204 ? undefined : await response.json()) as T
  },
  async delete(path: string) {
    await send(path, 'DELETE')
  },
  async blob(path: string) {
    const response = await send(path, 'GET')
    return response.blob()
  },
}
