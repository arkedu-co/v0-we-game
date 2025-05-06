// Este arquivo fornece alternativas compatíveis para funções de next/headers
// para uso em componentes que não são Server Components

// Alternativa para cookies()
export function compatCookies() {
  // Retorna um objeto vazio em vez de chamar cookies()
  return {}
}

// Alternativa para headers()
export function compatHeaders() {
  // Retorna um objeto vazio em vez de chamar headers()
  return {}
}

// Função para verificar se estamos no servidor
export function isServer() {
  return typeof window === "undefined"
}

// Função para verificar se estamos no cliente
export function isClient() {
  return typeof window !== "undefined"
}
