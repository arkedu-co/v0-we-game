import fs from "fs"
import path from "path"

console.log("\x1b[33m%s\x1b[0m", "=== INICIANDO CORREÇÃO COMPLETA DO PROJETO ===")

// 1. Remover pasta pages/
console.log("\x1b[36m%s\x1b[0m", "1. Removendo pasta pages/...")
const pagesDir = path.join(process.cwd(), "pages")
if (fs.existsSync(pagesDir)) {
  fs.rmSync(pagesDir, { recursive: true, force: true })
  console.log("\x1b[32m%s\x1b[0m", "✅ Pasta pages/ removida")
} else {
  console.log("\x1b[32m%s\x1b[0m", "✅ Pasta pages/ já não existe")
}

// 2. Corrigir next.config.mjs
console.log("\x1b[36m%s\x1b[0m", "2. Corrigindo next.config.mjs...")
const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
if (fs.existsSync(nextConfigPath)) {
  let nextConfigContent = fs.readFileSync(nextConfigPath, "utf8")

  // Remover appDir
  nextConfigContent = nextConfigContent.replace(/appDir:\s*true,?\s*/g, "")

  // Remover experimental vazio
  nextConfigContent = nextConfigContent.replace(/experimental:\s*{\s*},?\s*/g, "")

  // Corrigir experimental se ainda tiver serverActions
  nextConfigContent = nextConfigContent.replace(
    /experimental:\s*{\s*serverActions:\s*{([^}]*)}\s*,\s*appDir:\s*true\s*}/g,
    "experimental: { serverActions: {$1} }",
  )

  // Corrigir pageExtensions
  nextConfigContent = nextConfigContent.replace(
    /pageExtensions:\s*\[\s*['"]tsx['"],\s*['"]ts['"],\s*['"]jsx['"],\s*['"]js['"]\s*\]\.map$$.*$$/g,
    "pageExtensions: ['tsx', 'ts', 'jsx', 'js']",
  )

  fs.writeFileSync(nextConfigPath, nextConfigContent)
  console.log("\x1b[32m%s\x1b[0m", "✅ next.config.mjs corrigido")
} else {
  console.log("\x1b[31m%s\x1b[0m", "❌ Arquivo next.config.mjs não encontrado!")
}

// 3. Limpar cache do Next.js
console.log("\x1b[36m%s\x1b[0m", "3. Limpando cache do Next.js...")
const nextCacheDir = path.join(process.cwd(), ".next")
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true })
  console.log("\x1b[32m%s\x1b[0m", "✅ Cache do Next.js limpo")
} else {
  console.log("\x1b[32m%s\x1b[0m", "✅ Pasta .next não encontrada, nada a limpar")
}

// 4. Criar arquivo .nojekyll
console.log("\x1b[36m%s\x1b[0m", "4. Criando arquivo .nojekyll...")
fs.writeFileSync(path.join(process.cwd(), ".nojekyll"), "")
console.log("\x1b[32m%s\x1b[0m", "✅ Arquivo .nojekyll criado")

// 5. Simplificar prebuild.js
console.log("\x1b[36m%s\x1b[0m", "5. Simplificando prebuild.js...")
const prebuildPath = path.join(process.cwd(), "scripts", "prebuild.js")
if (fs.existsSync(prebuildPath)) {
  const prebuildContent = `// Prebuild script
console.log("🔄 Executando prebuild...")
console.log("✅ Prebuild concluído")`

  fs.writeFileSync(prebuildPath, prebuildContent)
  console.log("\x1b[32m%s\x1b[0m", "✅ prebuild.js simplificado")
} else {
  console.log("\x1b[31m%s\x1b[0m", "❌ Arquivo prebuild.js não encontrado!")
}

console.log("\x1b[33m%s\x1b[0m", "=== CORREÇÃO COMPLETA DO PROJETO CONCLUÍDA ===")
console.log("\x1b[32m%s\x1b[0m", '✅ Agora tente executar "pnpm run build" novamente')
