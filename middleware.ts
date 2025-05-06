import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Criar cliente Supabase para o middleware
  const res = NextResponse.next()

  // Continuar com a requisição para todas as rotas
  return res
}

// Configurar o matcher para ser mais específico
export const config = {
  matcher: [
    // Rotas específicas que precisam de autenticação
    "/professor/dashboard/:path*",
  ],
}
