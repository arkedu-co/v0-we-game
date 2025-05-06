import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Encontrar todos os arquivos que importam next/headers
console.log("Procurando arquivos que importam next/headers...")

try {
  // Usar grep para encontrar rapidamente todos os arquivos com importações de next/headers
  const grepCommand = 'grep -r "next/headers" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .'
  const grepResult = execSync(grepCommand, { encoding: "utf8" })

  const affectedFiles = new Set()

  // Processar os resultados do grep
  grepResult.split("\n").forEach((line) => {
    if (!line) return

    // Formato típico do grep: ./path/to/file.tsx:import { cookies } from 'next/headers'
    const filePath = line.split(":")[0]

    if (filePath && !filePath.includes("node_modules") && !filePath.includes(".next")) {
      affectedFiles.add(filePath)
    }
  })

  console.log(`Encontrados ${affectedFiles.size} arquivos com importações de next/headers.`)

  // Criar versões alternativas dos componentes afetados
  affectedFiles.forEach((filePath) => {
    console.log(`Processando: ${filePath}`)

    const content = fs.readFileSync(filePath, "utf8")

    // Verificar se o arquivo está no diretório app/
    const isInAppDir = filePath.includes("/app/")

    if (!isInAppDir) {
      console.log(`AVISO: Arquivo fora do diretório app/ importando next/headers: ${filePath}`)

      // Criar uma versão alternativa do componente
      const alternativeContent = content
        // Substituir importações de next/headers
        .replace(/import\s+.*\s+from\s+['"]next\/headers['"]/g, "// Importação de next/headers removida")
        .replace(
          /import\s+\{\s*(.*?)\s*\}\s+from\s+['"]next\/headers['"]/g,
          "// Importação de {$1} de next/headers removida",
        )
        // Substituir uso de cookies()
        .replace(/cookies$$$$/g, "/* cookies() removido */ ({})")
        // Substituir uso de headers()
        .replace(/headers$$$$/g, "/* headers() removido */ ({})")
        // Adicionar comentário explicativo
        .replace(
          /^/,
          "// VERSÃO MODIFICADA: Importações de next/headers foram removidas\n// Este arquivo foi modificado automaticamente para compatibilidade\n\n",
        )

      // Salvar a versão modificada
      fs.writeFileSync(filePath, alternativeContent, "utf8")
      console.log(`Arquivo modificado: ${filePath}`)
    }
  })

  console.log("Processo concluído com sucesso!")
} catch (error) {
  console.error("Erro ao executar o script:", error)

  // Abordagem alternativa se grep falhar
  console.log("Tentando abordagem alternativa...")

  // Função para verificar se um arquivo contém importações de next/headers
  function checkFileForHeaders(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8")
      return content.includes("next/headers")
    } catch (err) {
      return false
    }
  }

  // Função para percorrer diretórios recursivamente
  function traverseDirectory(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)

      // Ignorar node_modules, .next, etc.
      if (filePath.includes("node_modules") || filePath.includes(".next") || filePath.includes(".git")) {
        continue
      }

      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        traverseDirectory(filePath)
      } else if (/\.(ts|tsx|js|jsx)$/.test(filePath) && checkFileForHeaders(filePath)) {
        console.log(`Encontrado arquivo com next/headers: ${filePath}`)

        // Verificar se o arquivo está no diretório app/
        const isInAppDir = filePath.includes("/app/")

        if (!isInAppDir) {
          console.log(`AVISO: Arquivo fora do diretório app/ importando next/headers: ${filePath}`)

          // Modificar o arquivo
          const content = fs.readFileSync(filePath, "utf8")
          const alternativeContent = content
            // Substituir importações de next/headers
            .replace(/import\s+.*\s+from\s+['"]next\/headers['"]/g, "// Importação de next/headers removida")
            .replace(
              /import\s+\{\s*(.*?)\s*\}\s+from\s+['"]next\/headers['"]/g,
              "// Importação de {$1} de next/headers removida",
            )
            // Substituir uso de cookies()
            .replace(/cookies$$$$/g, "/* cookies() removido */ ({})")
            // Substituir uso de headers()
            .replace(/headers$$$$/g, "/* headers() removido */ ({})")
            // Adicionar comentário explicativo
            .replace(
              /^/,
              "// VERSÃO MODIFICADA: Importações de next/headers foram removidas\n// Este arquivo foi modificado automaticamente para compatibilidade\n\n",
            )

          // Salvar a versão modificada
          fs.writeFileSync(filePath, alternativeContent, "utf8")
          console.log(`Arquivo modificado: ${filePath}`)
        }
      }
    }
  }

  // Iniciar a verificação a partir do diretório raiz
  traverseDirectory(".")
  console.log("Processo alternativo concluído!")
}
