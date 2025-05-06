// Este script pode ser executado manualmente para corrigir imports problemáticos
// Execute com: npx tsx scripts/fix-headers-imports.ts

import fs from "fs"
import path from "path"

// Função para verificar e corrigir recursivamente os arquivos em um diretório
function fixDirectory(dir: string, results: string[] = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Ignorar node_modules e .next
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        fixDirectory(filePath, results)
      }
    } else if (
      stat.isFile() &&
      (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx"))
    ) {
      // Verificar se o arquivo está na pasta pages/
      const isInPagesDir = filePath.includes("/pages/")

      if (isInPagesDir) {
        let content = fs.readFileSync(filePath, "utf8")
        let modified = false

        // Corrigir imports de lib/supabase/server
        if (content.includes("import") && content.includes("lib/supabase/server")) {
          content = content.replace(
            /import\s+\{\s*([^}]*getSupabaseServer[^}]*)\s*\}\s+from\s+['"](.*)\/lib\/supabase\/server['"]/g,
            "import { $1, getSupabaseServerCompat } from '$2/lib/supabase/server'",
          )

          // Substituir usos de getSupabaseServer por getSupabaseServerCompat
          content = content.replace(/getSupabaseServer$$$$/g, "getSupabaseServerCompat()")

          modified = true
        }

        // Corrigir imports de next/headers
        if (content.includes("import") && content.includes("next/headers")) {
          // Comentar imports de next/headers
          content = content.replace(
            /import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]next\/headers['"]/g,
            "// Import removido para compatibilidade com Pages Router\n// import { $1 } from 'next/headers'",
          )

          modified = true
        }

        if (modified) {
          fs.writeFileSync(filePath, content)
          results.push(filePath)
        }
      }
    }
  }

  return results
}

// Corrigir o projeto
const projectRoot = path.resolve(__dirname, "..")
const results = fixDirectory(projectRoot)

console.log("Arquivos corrigidos:")
results.forEach((file) => {
  console.log(`- ${path.relative(projectRoot, file)}`)
})

if (results.length === 0) {
  console.log("Nenhum arquivo precisou ser corrigido")
}
