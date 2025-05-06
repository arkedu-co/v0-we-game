// Este script pode ser executado manualmente para verificar o uso de next/headers
// Execute com: npx tsx scripts/check-headers-usage.ts

import fs from "fs"
import path from "path"

// Função para verificar recursivamente os arquivos em um diretório
function checkDirectory(dir: string, results: string[] = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Ignorar node_modules e .next
      if (file !== "node_modules" && file !== ".next") {
        checkDirectory(filePath, results)
      }
    } else if (
      stat.isFile() &&
      (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx"))
    ) {
      const content = fs.readFileSync(filePath, "utf8")
      if (content.includes("next/headers")) {
        results.push(filePath)
      }
    }
  }

  return results
}

// Verificar o projeto
const projectRoot = path.resolve(__dirname, "..")
const results = checkDirectory(projectRoot)

console.log("Arquivos que usam next/headers:")
results.forEach((file) => {
  console.log(`- ${path.relative(projectRoot, file)}`)
})

if (results.length === 0) {
  console.log("Nenhum arquivo encontrado usando next/headers")
}
