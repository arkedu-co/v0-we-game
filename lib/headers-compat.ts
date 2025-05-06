/**
 * Compatibilidade para next/headers em componentes cliente e páginas
 * Este arquivo fornece versões compatíveis das funções de next/headers
 */

// Versão compatível de cookies()
export function cookies() {
  // Em componentes cliente, retornamos um objeto com métodos vazios
  return {
    get: (name: string) => null,
    getAll: () => [],
    set: () => {},
    delete: () => {},
    has: () => false,
    size: 0,
  }
}

// Versão compatível de headers()
export function headers() {
  // Em componentes cliente, retornamos um objeto Headers vazio
  return new Headers()
}

// Exportar como default para compatibilidade com importações default
const headersCompat = {
  cookies,
  headers,
}

export default headersCompat
