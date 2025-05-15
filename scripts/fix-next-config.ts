import fs from "fs"
import path from "path"

console.log("\x1b[33m%s\x1b[0m", "=== INICIANDO CORREÇÃO DO NEXT.CONFIG.MJS ===")

const nextConfigPath = path.join(process.cwd(), "next.config.mjs")

if (!fs.existsSync(nextConfigPath)) {
  console.log("\x1b[31m%s\x1b[0m", "❌ Arquivo next.config.mjs não encontrado!")
  process.exit(1)
}

let nextConfigContent = fs.readFileSync(nextConfigPath, "utf8")

// Verificar se o arquivo contém a opção appDir
if (nextConfigContent.includes("appDir")) {
  console.log("\x1b[36m%s\x1b[0m", "🔍 Encontrada opção 'appDir' obsoleta. Removendo...")

  // Remover a opção appDir
  nextConfigContent = nextConfigContent.replace(/appDir:\s*true,?\s*/g, "")

  // Remover experimental vazio se for o caso
  nextConfigContent = nextConfigContent.replace(/experimental:\s*{\s*},?\s*/g, "")

  // Corrigir experimental se ainda tiver serverActions
  nextConfigContent = nextConfigContent.replace(
    /experimental:\s*{\s*serverActions:\s*{([^}]*)}\s*,\s*appDir:\s*true\s*}/g,
    "experimental: { serverActions: {$1} }",
  )

  fs.writeFileSync(nextConfigPath, nextConfigContent)
  console.log("\x1b[32m%s\x1b[0m", "✅ Opção 'appDir' removida com sucesso!")
} else {
  console.log("\x1b[32m%s\x1b[0m", "✅ Arquivo next.config.mjs já está correto!")
}

console.log("\x1b[33m%s\x1b[0m", "=== CORREÇÃO DO NEXT.CONFIG.MJS CONCLUÍDA ===")
console.log("\x1b[32m%s\x1b[0m", '✅ Agora tente executar "pnpm run build" novamente')
