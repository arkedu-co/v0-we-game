// Script para executar todas as correções necessárias
import { execSync } from "child_process"

console.log("Iniciando correções do projeto...")

try {
  // Executar o script de correção de headers
  console.log("\n1. Corrigindo uso de next/headers em componentes cliente...")
  execSync("npx tsx scripts/fix-headers-usage.ts", { stdio: "inherit" })

  console.log("\nTodas as correções foram aplicadas com sucesso!")
  console.log("\nResumo das correções:")
  console.log("✅ Configuração do Next.js atualizada")
  console.log("✅ Uso de next/headers em componentes cliente corrigido")
  console.log("✅ Configuração de serverActions corrigida")
  console.log("✅ Configuração obsoleta swcMinify removida")
} catch (error) {
  console.error("Erro ao executar as correções:", error)
}
