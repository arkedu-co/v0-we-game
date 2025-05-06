import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname

  // Redirecionar para a página correta
  return NextResponse.redirect(new URL(path, url.origin))
}

export async function POST(request: NextRequest) {
  return GET(request)
}
