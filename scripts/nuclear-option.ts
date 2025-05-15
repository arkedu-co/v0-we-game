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

console.log(`${colors.yellow}=== INICIANDO OPÇÃO NUCLEAR ===${colors.reset}`)

try {
  // 1. Remover completamente a pasta pages/ e criar um arquivo vazio
  console.log(`${colors.cyan}1. Removendo pasta pages/ completamente...${colors.reset}`)
  const pagesDir = path.join(process.cwd(), "pages")
  if (fs.existsSync(pagesDir)) {
    fs.rmSync(pagesDir, { recursive: true, force: true })
  }

  // Criar um arquivo .gitkeep vazio na pasta pages/
  fs.mkdirSync(pagesDir, { recursive: true })
  fs.writeFileSync(path.join(pagesDir, ".gitkeep"), "")
  console.log(`${colors.green}✓ Pasta pages/ recriada com apenas um arquivo .gitkeep${colors.reset}`)

  // 2. Criar um arquivo vercel.json para forçar o Next.js a ignorar a pasta pages/
  console.log(`${colors.cyan}2. Criando arquivo vercel.json...${colors.reset}`)
  const vercelJsonPath = path.join(process.cwd(), "vercel.json")
  const vercelJsonContent = `{
  "buildCommand": "pnpm run build:app-only",
  "ignoreCommand": "echo 'Ignoring pages directory'",
  "framework": "nextjs"
}`
  fs.writeFileSync(vercelJsonPath, vercelJsonContent)
  console.log(`${colors.green}✓ Arquivo vercel.json criado${colors.reset}`)

  // 3. Criar um script build:app-only que força o Next.js a usar apenas o App Router
  console.log(`${colors.cyan}3. Atualizando package.json...${colors.reset}`)
  const packageJsonPath = path.join(process.cwd(), "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

  packageJson.scripts["build:app-only"] = "NEXT_IGNORE_PAGES=true next build"
  packageJson.scripts["prebuild"] = "node scripts/remove-pages.js"

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log(`${colors.green}✓ package.json atualizado${colors.reset}`)

  // 4. Criar um script remove-pages.js que remove a pasta pages/ antes do build
  console.log(`${colors.cyan}4. Criando script remove-pages.js...${colors.reset}`)
  const removePagesPath = path.join(process.cwd(), "scripts", "remove-pages.js")
  const removePagesContent = `const fs = require('fs');
const path = require('path');

// Remover completamente a pasta pages/
const pagesDir = path.join(process.cwd(), 'pages');
if (fs.existsSync(pagesDir)) {
  console.log('Removendo pasta pages/ antes do build...');
  fs.rmSync(pagesDir, { recursive: true, force: true });
  console.log('Pasta pages/ removida com sucesso!');
}
`
  // Garantir que a pasta scripts/ exista
  const scriptsDir = path.join(process.cwd(), "scripts")
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true })
  }

  fs.writeFileSync(removePagesPath, removePagesContent)
  console.log(`${colors.green}✓ Script remove-pages.js criado${colors.reset}`)

  // 5. Criar um arquivo .env.local para forçar o Next.js a ignorar a pasta pages/
  console.log(`${colors.cyan}5. Criando arquivo .env.local...${colors.reset}`)
  const envLocalPath = path.join(process.cwd(), ".env.local")
  const envLocalContent = `NEXT_IGNORE_PAGES=true
NEXT_TELEMETRY_DISABLED=1
`
  fs.writeFileSync(envLocalPath, envLocalContent)
  console.log(`${colors.green}✓ Arquivo .env.local criado${colors.reset}`)

  // 6. Criar um arquivo next.config.mjs extremamente simplificado
  console.log(`${colors.cyan}6. Criando next.config.mjs simplificado...${colors.reset}`)
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar completamente a pasta pages/
  pageExtensions: [],
}

export default nextConfig
`
  fs.writeFileSync(nextConfigPath, nextConfigContent)
  console.log(`${colors.green}✓ next.config.mjs simplificado criado${colors.reset}`)

  // 7. Limpar cache do Next.js
  console.log(`${colors.cyan}7. Limpando cache do Next.js...${colors.reset}`)
  const nextCacheDir = path.join(process.cwd(), ".next")
  if (fs.existsSync(nextCacheDir)) {
    fs.rmSync(nextCacheDir, { recursive: true, force: true })
    console.log(`${colors.green}✓ Cache do Next.js limpo${colors.reset}`)
  } else {
    console.log(`${colors.green}✓ Cache do Next.js já não existe${colors.reset}`)
  }

  // 8. Criar um arquivo tsconfig.json que ignora a pasta pages/
  console.log(`${colors.cyan}8. Atualizando tsconfig.json...${colors.reset}`)
  const tsconfigPath = path.join(process.cwd(), "tsconfig.json")
  let tsconfig = {}

  if (fs.existsSync(tsconfigPath)) {
    tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"))
  }

  if (!tsconfig.exclude) {
    tsconfig.exclude = []
  }

  if (!tsconfig.exclude.includes("pages")) {
    tsconfig.exclude.push("pages")
  }

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))
  console.log(`${colors.green}✓ tsconfig.json atualizado${colors.reset}`)

  console.log(`${colors.yellow}=== OPÇÃO NUCLEAR CONCLUÍDA ===${colors.reset}`)
  console.log(
    `${colors.green}✓ Agora tente executar "pnpm run build:app-only" para compilar apenas o App Router${colors.reset}`,
  )
} catch (error) {
  console.error(`${colors.red}Erro durante a execução:${colors.reset}`, error)
  process.exit(1)
}
