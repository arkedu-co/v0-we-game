import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

// Lista de extensões de arquivo a serem verificadas
const extensions = [".ts", ".tsx", ".js", ".jsx"]

// Função para verificar se um arquivo deve ser processado
function shouldProcessFile(filePath: string): boolean {
  // Ignorar node_modules, .next, etc.
  if (
    filePath.includes("node_modules") ||
    filePath.includes(".next") ||
    filePath.includes("build") ||
    filePath.includes(".git")
  ) {
    return false
  }

  // Verificar extensão
  const ext = path.extname(filePath)
  return extensions.includes(ext)
}

// Função para verificar e corrigir importações de next/headers
function fixNextHeadersImports(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Verificar se o arquivo importa next/headers
    if (content.includes("next/headers")) {
      console.log(`Arquivo com importação de next/headers: ${filePath}`)

      // Verificar se o arquivo está no diretório app/
      const isInAppDir = filePath.includes(path.join("app", ""))

      if (!isInAppDir) {
        console.log(`AVISO: Arquivo fora do diretório app/ importando next/headers: ${filePath}`)

        // Substituir a importação por uma alternativa compatível
        const updatedContent = content
          .replace(
            /import\s+.*\s+from\s+['"]next\/headers['"]/g,
            "// REMOVIDO: import de next/headers não é permitido fora do diretório app/",
          )
          .replace(
            /import\s+\{\s*.*\s*\}\s+from\s+['"]next\/headers['"]/g,
            "// REMOVIDO: import de next/headers não é permitido fora do diretório app/",
          )

        fs.writeFileSync(filePath, updatedContent, "utf8")
        console.log(`Corrigido: ${filePath}`)
      }
    }
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error)
  }
}

// Função para percorrer diretórios recursivamente
function traverseDirectory(dir: string): void {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Ignorar diretório pages/
      if (file === "pages") {
        console.log(`Ignorando diretório pages/: ${filePath}`)
        continue
      }
      traverseDirectory(filePath)
    } else if (shouldProcessFile(filePath)) {
      fixNextHeadersImports(filePath)
    }
  }
}

// Iniciar o processo
console.log("Iniciando verificação de importações de next/headers...")
traverseDirectory(rootDir)
console.log("Verificação concluída!")
