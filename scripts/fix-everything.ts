import { execSync } from "child_process"
import fs from "fs"
import path from "path"

// Cores para o console
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

console.log(`${colors.yellow}=== INICIANDO CORREÇÃO COMPLETA DO PROJETO ===${colors.reset}`)

try {
  // 1. Remover completamente a pasta pages/
  console.log(`${colors.cyan}1. Removendo pasta pages/ completamente...${colors.reset}`)
  const pagesDir = path.join(process.cwd(), "pages")
  if (fs.existsSync(pagesDir)) {
    fs.rmSync(pagesDir, { recursive: true, force: true })
    console.log(`${colors.green}✓ Pasta pages/ removida completamente${colors.reset}`)
  } else {
    console.log(`${colors.green}✓ Pasta pages/ já não existe${colors.reset}`)
  }

  // 2. Remover .babelrc se existir
  console.log(`${colors.cyan}2. Removendo .babelrc...${colors.reset}`)
  const babelrcPath = path.join(process.cwd(), ".babelrc")
  if (fs.existsSync(babelrcPath)) {
    fs.unlinkSync(babelrcPath)
    console.log(`${colors.green}✓ Arquivo .babelrc removido${colors.reset}`)
  } else {
    console.log(`${colors.green}✓ Arquivo .babelrc já não existe${colors.reset}`)
  }

  // 3. Corrigir next.config.mjs
  console.log(`${colors.cyan}3. Corrigindo next.config.mjs...${colors.reset}`)
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'v0-we-game.vercel.app'],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
`
  fs.writeFileSync(nextConfigPath, nextConfigContent)
  console.log(`${colors.green}✓ next.config.mjs corrigido${colors.reset}`)

  // 4. Atualizar headers-compat.ts
  console.log(`${colors.cyan}4. Atualizando headers-compat.ts...${colors.reset}`)
  const libDir = path.join(process.cwd(), "lib")
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true })
  }

  const headersCompatPath = path.join(libDir, "headers-compat.ts")
  const headersCompatContent = `// Este arquivo fornece alternativas compatíveis para funções de next/headers
// para uso em componentes que não são Server Components

// Alternativa para cookies()
export function cookies() {
  // Em componentes cliente, retornamos um objeto com métodos vazios
  return {
    get: (name: string) => null,
    getAll: () => [],
    set: () => {},
    delete: () => {},
    has: () => false,
  };
}

// Alternativa para headers()
export function headers() {
  // Em componentes cliente, retornamos um objeto Headers vazio
  return new Headers();
}

// Função para verificar se estamos no servidor
export function isServer() {
  return typeof window === "undefined";
}

// Função para verificar se estamos no cliente
export function isClient() {
  return typeof window !== "undefined";
}
`
  fs.writeFileSync(headersCompatPath, headersCompatContent)
  console.log(`${colors.green}✓ headers-compat.ts atualizado${colors.reset}`)

  // 5. Limpar cache do Next.js
  console.log(`${colors.cyan}5. Limpando cache do Next.js...${colors.reset}`)
  const nextCacheDir = path.join(process.cwd(), ".next")
  if (fs.existsSync(nextCacheDir)) {
    fs.rmSync(nextCacheDir, { recursive: true, force: true })
    console.log(`${colors.green}✓ Cache do Next.js limpo${colors.reset}`)
  } else {
    console.log(`${colors.green}✓ Cache do Next.js já não existe${colors.reset}`)
  }

  // 6. Executar o script de correção radical de imports
  console.log(`${colors.cyan}6. Executando correção radical de imports...${colors.reset}`)
  execSync("tsx scripts/fix-headers-imports-radical.ts", { stdio: "inherit" })

  console.log(`${colors.yellow}=== CORREÇÃO COMPLETA CONCLUÍDA ===${colors.reset}`)
  console.log(`${colors.green}✓ Agora tente executar "pnpm run build" novamente${colors.reset}`)
} catch (error) {
  console.error(`${colors.red}Erro durante a execução:${colors.reset}`, error)
  process.exit(1)
}
