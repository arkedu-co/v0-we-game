// Este arquivo fornece alternativas compatíveis para funções de next/headers
// para uso em componentes que não são Server Components

// Alternativa para cookies()
export function cookies() {
  // Em componentes cliente, retornamos um objeto com métodos vazios
  return {
    get: (name: string) => null,
    getAll: () => [],
    set: () => {},
    delete: () => {},
    has: () => false,
  }
}

// Alternativa para headers()
export function headers() {
  // Em componentes cliente, retornamos um objeto Headers vazio
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
