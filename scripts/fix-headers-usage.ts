// Este script identifica e corrige o uso de next/headers em componentes cliente
import fs from "fs"
import path from "path"

// Função para verificar e corrigir arquivos
function processFile(filePath: string): boolean {
  // Ignorar arquivos em node_modules e .next
  if (filePath.includes("node_modules") || filePath.includes(".next")) {
    return false
  }

  // Ler o conteúdo do arquivo
  let content: string
  try {
    content = fs.readFileSync(filePath, "utf8")
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, error)
    return false
  }

  // Verificar se o arquivo usa next/headers
  if (!content.includes("next/headers")) {
    return false
  }

  // Verificar se é um componente cliente
  const isClientComponent = content.includes("'use client'") || content.includes('"use client"')

  if (!isClientComponent) {
    return false
  }

  console.log(`Encontrado uso de next/headers em componente cliente: ${filePath}`)

  // Substituir importações de next/headers
  let modified = content.replace(
    /import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]next\/headers['"]/g,
    "// Importação de next/headers removida\nimport { compatCookies, compatHeaders } from '@/lib/headers-compat'",
  )

  // Substituir uso de cookies() e headers()
  modified = modified.replace(/cookies$$$$/g, "compatCookies()")
  modified = modified.replace(/headers$$$$/g, "compatHeaders()")

  // Salvar o arquivo modificado
  try {
    fs.writeFileSync(filePath, modified, "utf8")
    console.log(`Arquivo corrigido: ${filePath}`)
    return true
  } catch (error) {
    console.error(`Erro ao salvar o arquivo ${filePath}:`, error)
    return false
  }
}

// Função para percorrer diretórios recursivamente
function processDirectory(dir: string): string[] {
  const correctedFiles: string[] = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stats = fs.statSync(itemPath)

      if (stats.isDirectory()) {
        // Processar subdiretórios recursivamente
        correctedFiles.push(...processDirectory(itemPath))
      } else if (
        stats.isFile() &&
        (itemPath.endsWith(".tsx") || itemPath.endsWith(".ts") || itemPath.endsWith(".jsx") || itemPath.endsWith(".js"))
      ) {
        // Processar arquivos
        if (processFile(itemPath)) {
          correctedFiles.push(itemPath)
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao processar o diretório ${dir}:`, error)
  }

  return correctedFiles
}

// Diretório raiz do projeto
const rootDir = path.resolve(__dirname, "..")

// Iniciar o processamento
console.log("Iniciando correção de uso de next/headers em componentes cliente...")
const correctedFiles = processDirectory(rootDir)

console.log("\nResumo:")
console.log(`Total de arquivos corrigidos: ${correctedFiles.length}`)

if (correctedFiles.length > 0) {
  console.log("\nArquivos corrigidos:")
  correctedFiles.forEach((file) => {
    console.log(`- ${path.relative(rootDir, file)}`)
  })
}

console.log("\nProcesso concluído!")
