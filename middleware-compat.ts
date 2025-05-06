import { type NextRequest, NextResponse } from "next/server"
import { createServerClientCompat } from "./lib/supabase/server-compat"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Usar a versão compatível que não depende de next/headers
  const supabase = createServerClientCompat()

  // Resto da lógica do middleware...

  return res
}

export const config = {
  matcher: [
    // Rotas que precisam de autenticação
    "/pages/dashboard/:path*",
    "/pages/admin/:path*",
    "/pages/escola/:path*",
    "/pages/professor/:path*",
    "/pages/aluno/:path*",
    "/pages/responsavel/:path*",
  ],
}
