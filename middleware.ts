import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware simplificado que não bloqueia rotas
export function middleware(request: NextRequest) {
  // Apenas observa as solicitações, não bloqueia nada
  return NextResponse.next()
}

// Configurar o matcher para ser mais específico
export const config = {
  matcher: [
    // Rotas que requerem autenticação
    "/admin/dashboard/:path*",
    "/escola/dashboard/:path*",
    "/professor/dashboard/:path*",
    "/aluno/dashboard/:path*",
    "/responsavel/dashboard/:path*",
  ],
}
