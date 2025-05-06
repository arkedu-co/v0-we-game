import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname

  // Redirecionar para a página correta com base no caminho
  if (path === "/") {
    return NextResponse.rewrite(new URL("/", request.url))
  } else if (path.startsWith("/admin")) {
    return NextResponse.rewrite(new URL(path, request.url))
  } else if (path.startsWith("/escola")) {
    return NextResponse.rewrite(new URL(path, request.url))
  } else if (path.startsWith("/professor")) {
    return NextResponse.rewrite(new URL(path, request.url))
  } else if (path.startsWith("/aluno")) {
    return NextResponse.rewrite(new URL(path, request.url))
  } else if (path.startsWith("/responsavel")) {
    return NextResponse.rewrite(new URL(path, request.url))
  } else if (path === "/setup") {
    return NextResponse.rewrite(new URL("/setup", request.url))
  } else {
    // Redirecionar para a página inicial para qualquer outro caminho
    return NextResponse.rewrite(new URL("/", request.url))
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

export const dynamic = "force-dynamic"
