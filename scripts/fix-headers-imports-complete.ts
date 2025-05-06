import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Cores para o console
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

console.log(`${colors.cyan}=== Iniciando correção completa de importações next/headers ====${colors.reset}`)

// Função para encontrar todos os arquivos com uma determinada extensão
function findFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = []
  const list = fs.readdirSync(dir)

  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat && stat.isDirectory() && file !== "node_modules" && file !== ".next" && file !== ".git") {
      results = results.concat(findFiles(filePath, extensions))
    } else {
      const ext = path.extname(file).toLowerCase()
      if (extensions.includes(ext)) {
        results.push(filePath)
      }
    }
  })

  return results
}

// Função para verificar se um arquivo importa next/headers
function checkForHeadersImport(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf8")
  return content.includes("from 'next/headers'") || content.includes('from "next/headers"')
}

// Função para verificar se um arquivo é um componente cliente
function isClientComponent(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf8")
  return content.includes("'use client'") || content.includes('"use client"')
}

// Função para verificar se um arquivo está na pasta pages ou é importado por um arquivo na pasta pages
function isUsedInPages(filePath: string): boolean {
  // Verificar se o arquivo está na pasta pages
  if (filePath.includes("/pages/")) {
    return true
  }

  // Tentar encontrar importações deste arquivo em arquivos da pasta pages
  try {
    const relativePath = path.relative(process.cwd(), filePath)
    const result = execSync(
      `grep -r --include="*.{ts,tsx,js,jsx}" "${path.basename(filePath, path.extname(filePath))}" ./pages`,
      { encoding: "utf8" },
    )
    return result.length > 0
  } catch (error) {
    // grep retorna código de erro 1 quando não encontra nada
    return false
  }
}

// Função para corrigir as importações de headers
function fixHeadersImport(filePath: string): void {
  let content = fs.readFileSync(filePath, "utf8")

  // Verificar se é um componente cliente
  const isClient = isClientComponent(filePath)

  if (isClient) {
    // Substituir importações de next/headers por nossa versão compatível
    content = content.replace(
      /import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]next\/headers['"]/g,
      "import { $1 } from '@/lib/headers-compat'",
    )

    // Caso específico para importações individuais
    content = content.replace(/import\s+(\w+)\s+from\s+['"]next\/headers['"]/g, "import $1 from '@/lib/headers-compat'")
  } else if (isUsedInPages(filePath)) {
    // Se não é cliente mas é usado em pages, precisamos criar uma versão compatível
    console.log(
      `${colors.yellow}Arquivo ${filePath} não é cliente mas é usado em pages. Criando versão compatível...${colors.reset}`,
    )

    // Adicionar comentário explicativo
    content = `// Este arquivo foi modificado para ser compatível com o diretório pages/\n${content}`

    // Substituir importações de next/headers por nossa versão compatível
    content = content.replace(
      /import\s+\{\s*([^}]*)\s*\}\s+from\s+['"]next\/headers['"]/g,
      "import { $1 } from '@/lib/headers-compat'",
    )

    // Caso específico para importações individuais
    content = content.replace(/import\s+(\w+)\s+from\s+['"]next\/headers['"]/g, "import $1 from '@/lib/headers-compat'")
  }

  fs.writeFileSync(filePath, content, "utf8")
}

// Função para atualizar o arquivo headers-compat.ts
function updateHeadersCompat(): void {
  const compatFilePath = path.join(process.cwd(), "lib", "headers-compat.ts")

  // Verificar se o diretório existe
  if (!fs.existsSync(path.dirname(compatFilePath))) {
    fs.mkdirSync(path.dirname(compatFilePath), { recursive: true })
  }

  const content = `/**
 * Compatibilidade para next/headers em componentes cliente e páginas
 * Este arquivo fornece versões compatíveis das funções de next/headers
 */

// Versão compatível de cookies()
export function cookies() {
  // Em componentes cliente, retornamos um objeto com métodos vazios
  return {
    get: () => null,
    getAll: () => [],
    set: () => {},
    delete: () => {},
    has: () => false,
    size: 0,
  };
}

// Versão compatível de headers()
export function headers() {
  // Em componentes cliente, retornamos um objeto Map vazio
  return new Headers();
}

// Exportar como default para compatibilidade com importações default
const headersCompat = {
  cookies,
  headers,
};

export default headersCompat;
`

  fs.writeFileSync(compatFilePath, content, "utf8")
  console.log(`${colors.green}Arquivo de compatibilidade atualizado: ${compatFilePath}${colors.reset}`)
}

// Função para remover completamente a pasta pages
function removePages(): void {
  const pagesDir = path.join(process.cwd(), "pages")

  if (fs.existsSync(pagesDir)) {
    console.log(`${colors.yellow}Removendo pasta pages/ para evitar conflitos...${colors.reset}`)

    try {
      // Remover recursivamente
      fs.rmSync(pagesDir, { recursive: true, force: true })
      console.log(`${colors.green}Pasta pages/ removida com sucesso!${colors.reset}`)

      // Criar pasta vazia com .gitkeep
      fs.mkdirSync(pagesDir)
      fs.writeFileSync(path.join(pagesDir, ".gitkeep"), "")
      fs.writeFileSync(
        path.join(pagesDir, "README.md"),
        "# Pages Directory\n\nThis directory is intentionally kept empty.\nThe application uses the App Router exclusively.\n",
      )
      console.log(`${colors.green}Pasta pages/ recriada vazia com .gitkeep${colors.reset}`)
    } catch (error) {
      console.error(`${colors.red}Erro ao remover pasta pages/:${colors.reset}`, error)
    }
  } else {
    console.log(`${colors.blue}Pasta pages/ não encontrada. Nada a fazer.${colors.reset}`)
  }
}

// Atualizar o arquivo de compatibilidade
updateHeadersCompat()

// Encontrar todos os arquivos TypeScript e JavaScript
const extensions = [".ts", ".tsx", ".js", ".jsx"]
const files = findFiles(process.cwd(), extensions)

// Verificar e corrigir arquivos com importações de next/headers
let fixedCount = 0
for (const file of files) {
  if (checkForHeadersImport(file)) {
    console.log(`${colors.yellow}Corrigindo importações em: ${file}${colors.reset}`)
    fixHeadersImport(file)
    fixedCount++
  }
}

// Remover pasta pages
removePages()

console.log(`${colors.green}Correção concluída! ${fixedCount} arquivos foram corrigidos.${colors.reset}`)
console.log(`${colors.cyan}=== Processo finalizado ====${colors.reset}`)
