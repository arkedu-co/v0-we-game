import fs from "fs"
import path from "path"

console.log("\x1b[33m%s\x1b[0m", "=== INICIANDO CORREÇÃO DA PASTA PAGES ===")

// 1. Remover completamente a pasta pages/
const pagesDir = path.join(process.cwd(), "pages")
if (fs.existsSync(pagesDir)) {
  console.log("\x1b[36m%s\x1b[0m", "1. Removendo pasta pages/...")
  fs.rmSync(pagesDir, { recursive: true, force: true })
  console.log("\x1b[32m%s\x1b[0m", "✓ Pasta pages/ removida")
}

// 2. Criar arquivo .nojekyll na raiz para evitar problemas com GitHub Pages
console.log("\x1b[36m%s\x1b[0m", "2. Criando arquivo .nojekyll...")
fs.writeFileSync(path.join(process.cwd(), ".nojekyll"), "")
console.log("\x1b[32m%s\x1b[0m", "✓ Arquivo .nojekyll criado")

// 3. Limpar cache do Next.js
console.log("\x1b[36m%s\x1b[0m", "3. Limpando cache do Next.js...")
const nextCacheDir = path.join(process.cwd(), ".next")
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true })
  console.log("\x1b[32m%s\x1b[0m", "✓ Cache do Next.js limpo")
} else {
  console.log("\x1b[32m%s\x1b[0m", "✓ Pasta .next não encontrada, nada a limpar")
}

// 4. Atualizar o arquivo next.config.mjs
console.log("\x1b[36m%s\x1b[0m", "4. Verificando next.config.mjs...")
const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8")

  // Verificar se o arquivo já foi corrigido
  if (nextConfigContent.includes("app/**/*.tsx")) {
    console.log("\x1b[36m%s\x1b[0m", "Corrigindo expressão regular inválida em next.config.mjs...")

    // Substituir a expressão regular inválida
    const correctedContent = nextConfigContent.replace(
      /pageExtensions:\s*\[\s*['"]tsx['"],\s*['"]ts['"],\s*['"]jsx['"],\s*['"]js['"]\s*\]\.map$$ext\s*=>\s*`app\/\*\*\/\*\.\${ext}`$$/g,
      "pageExtensions: ['tsx', 'ts', 'jsx', 'js']",
    )

    fs.writeFileSync(nextConfigPath, correctedContent)
    console.log("\x1b[32m%s\x1b[0m", "✓ next.config.mjs corrigido")
  } else {
    console.log("\x1b[32m%s\x1b[0m", "✓ next.config.mjs já está correto")
  }
} else {
  console.log("\x1b[31m%s\x1b[0m", "✗ Arquivo next.config.mjs não encontrado!")
}

console.log("\x1b[33m%s\x1b[0m", "=== CORREÇÃO DA PASTA PAGES CONCLUÍDA ===")
console.log("\x1b[32m%s\x1b[0m", '✓ Agora tente executar "pnpm run build" novamente')
