// Detecta se estamos no App Router ou Pages Router
export function isAppRouter(): boolean {
  // No lado do cliente, verificamos se window está definido
  if (typeof window !== "undefined") {
    return false // No cliente, assumimos que é seguro usar a versão compatível
  }

  // No lado do servidor, tentamos detectar com base no ambiente
  try {
    // Se isso não lançar um erro, estamos no App Router
    require("next/headers")
    return true
  } catch (e) {
    // Se lançar um erro, estamos no Pages Router
    return false
  }
}
