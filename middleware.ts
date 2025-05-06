import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Criar cliente Supabase para o middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar se há uma sessão válida
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Obter o caminho da URL
  const path = req.nextUrl.pathname

  // Verificar se a rota requer autenticação
  if (path.startsWith("/professor/dashboard") && !session) {
    // Redirecionar para a página de login se não houver sessão
    const redirectUrl = new URL("/professor/login", req.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Continuar com a requisição se estiver autenticado ou se a rota não requer autenticação
  return res
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    // Rotas que precisam de autenticação
    "/professor/dashboard/:path*",
  ],
}
