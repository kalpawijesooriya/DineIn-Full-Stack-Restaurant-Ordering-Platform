const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5038/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`API request failed: ${options?.method ?? 'GET'} ${url} -> ${response.status}`, errorBody)
    throw new Error(`API error ${response.status}: ${errorBody}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
}

export const HUB_URL = API_BASE_URL.replace(/\/api$/, '') + '/hubs/orders'
