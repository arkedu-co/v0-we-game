import { isAppRouter } from "../env-detection"
import { getSupabaseServer, getSupabaseServerCompat, createServerClient, createServerClientCompat } from "./server"

// Escolhe automaticamente a versão correta com base no ambiente
export function getSupabaseAuto() {
  if (isAppRouter()) {
    // Estamos no App Router, podemos usar a versão que depende de next/headers
    return getSupabaseServer()
  } else {
    // Estamos no Pages Router, usamos a versão compatível
    return getSupabaseServerCompat()
  }
}

// Escolhe automaticamente a versão correta com base no ambiente
export function createServerClientAuto() {
  if (isAppRouter()) {
    // Estamos no App Router, podemos usar a versão que depende de next/headers
    return createServerClient
  } else {
    // Estamos no Pages Router, usamos a versão compatível
    return createServerClientCompat()
  }
}
