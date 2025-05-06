import { execSync } from "child_process"

console.log("Iniciando correção de emergência para problemas de compilação...")

try {
  // Executar o script de correção de headers
  console.log("Executando correção de importações next/headers...")
  execSync("npx tsx scripts/fix-headers-imports-complete.ts", { stdio: "inherit" })

  // Limpar cache do Next.js
  console.log("Limpando cache do Next.js...")
  execSync("rm -rf .next", { stdio: "inherit" })

  console.log("Correção de emergência concluída com sucesso!")
  console.log("Agora você pode tentar compilar novamente o projeto.")
} catch (error) {
  console.error("Erro durante a correção de emergência:", error)
  process.exit(1)
}
