// Este arquivo fornece alternativas compatíveis para funções de next/headers
// para uso em componentes que não são Server Components

// Alternativa para cookies()
export function compatCookies() {
  // Verifica se estamos no cliente
  if (typeof window !== "undefined") {
    // Implementação cliente que analisa document.cookie
    const cookies = {}
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=")
      if (name) cookies[name] = value
    })

    return {
      // Implementa uma API similar à de cookies() do Next.js
      get: (name) => (cookies[name] ? { name, value: cookies[name] } : undefined),
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
      has: (name) => !!cookies[name],
    }
  }

  // Retorna um objeto vazio com métodos simulados para SSR
  return {
    get: () => undefined,
    getAll: () => [],
    has: () => false,
  }
}

// Alternativa para headers()
export function compatHeaders() {
  // No cliente, retorna um objeto Headers vazio ou com informações limitadas
  if (typeof window !== "undefined") {
    const headers = new Headers()

    // Adiciona alguns headers comuns que podem ser úteis
    headers.set("user-agent", navigator.userAgent)
    headers.set("host", window.location.host)
    headers.set("referer", document.referrer)

    return headers
  }

  // Retorna um objeto Headers vazio para SSR
  return new Headers()
}

// Função para verificar se estamos no servidor
export function isServer() {
  return typeof window === "undefined"
}

// Função para verificar se estamos no cliente
export function isClient() {
  return typeof window !== "undefined"
}
