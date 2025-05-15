// Este arquivo existe apenas para compatibilidade
// Não use next/headers em componentes cliente

export function cookies() {
  return {
    get: () => null,
    getAll: () => [],
    has: () => false,
  }
}

export function headers() {
  return new Headers()
}

export function isServer() {
  return typeof window === "undefined"
}

export function isClient() {
  return typeof window !== "undefined"
}
