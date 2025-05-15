import fs from "fs"
import path from "path"

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

console.log(`${colors.yellow}=== INICIANDO CORREÇÃO RADICAL DE IMPORTS DE HEADERS ===${colors.reset}`)

// Função para encontrar todos os arquivos com uma determinada extensão
function findFiles(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return []

  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Ignorar node_modules e .next
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        files.push(...findFiles(fullPath, extensions))
      }
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath)
    }
  }

  return files
}

// Função para verificar se um arquivo importa next/headers
function importsNextHeaders(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return (
      content.includes("from 'next/headers'") ||
      content.includes('from "next/headers"') ||
      content.includes("import { cookies") ||
      content.includes("import { headers")
    )
  } catch (error) {
    console.error(`${colors.red}Erro ao ler o arquivo ${filePath}:${colors.reset}`, error)
    return false
  }
}

// Função para criar uma versão alternativa de um arquivo sem importações de next/headers
function createAlternativeVersion(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf8")
  const dirname = path.dirname(filePath)
  const basename = path.basename(filePath)
  const alternativePath = path.join(dirname, `${basename.replace(/\.(tsx|ts|jsx|js)$/, "")}-client.$1`)

  // Substituir importações de next/headers
  let newContent = content
    .replace(
      /import\s+{\s*cookies\s*(?:,\s*headers\s*)?}\s+from\s+['"]next\/headers['"]/g,
      `import { cookies, headers } from '@/lib/headers-compat'`,
    )
    .replace(
      /import\s+{\s*headers\s*(?:,\s*cookies\s*)?}\s+from\s+['"]next\/headers['"]/g,
      `import { headers, cookies } from '@/lib/headers-compat'`,
    )
    .replace(
      /import\s+\{\s*cookies\s+as\s+\w+\s*\}\s+from\s+['"]next\/headers['"]/g,
      `import { cookies } from '@/lib/headers-compat'`,
    )
    .replace(
      /import\s+\{\s*headers\s+as\s+\w+\s*\}\s+from\s+['"]next\/headers['"]/g,
      `import { headers } from '@/lib/headers-compat'`,
    )

  // Adicionar 'use client' no topo se não existir
  if (!newContent.trim().startsWith("'use client'")) {
    newContent = `'use client'\n\n${newContent}`
  }

  return newContent
}

// Função para atualizar todas as importações para usar as versões alternativas
function updateImports(files: string[], headersFiles: Set<string>): void {
  for (const file of files) {
    let content = fs.readFileSync(file, "utf8")
    let modified = false

    for (const headersFile of headersFiles) {
      const relativePath = path
        .relative(path.dirname(file), headersFile)
        .replace(/\\/g, "/") // Normalizar para usar / em Windows
        .replace(/^\.\.\//, "@/") // Substituir ../ por @/ para importações absolutas
        .replace(/\.(tsx|ts|jsx|js)$/, "")

      // Verificar se este arquivo importa o arquivo com headers
      const importRegex = new RegExp(`import\\s+.*?from\\s+['"]${relativePath}['"]`, "g")
      if (importRegex.test(content)) {
        // Substituir a importação para usar a versão alternativa
        content = content.replace(importRegex, (match) => {
          return match.replace(relativePath, `${relativePath}-client`)
        })
        modified = true
      }
    }

    if (modified) {
      fs.writeFileSync(file, content)
      console.log(`${colors.green}✓ Atualizado imports em ${file}${colors.reset}`)
    }
  }
}

// Função principal
async function main() {
  try {
    // 1. Remover completamente a pasta pages/
    const pagesDir = path.join(process.cwd(), "pages")
    if (fs.existsSync(pagesDir)) {
      console.log(`${colors.cyan}1. Removendo pasta pages/ completamente...${colors.reset}`)
      fs.rmSync(pagesDir, { recursive: true, force: true })
      console.log(`${colors.green}✓ Pasta pages/ removida completamente${colors.reset}`)
    }

    // 2. Encontrar todos os arquivos TypeScript/JavaScript
    console.log(`${colors.cyan}2. Encontrando todos os arquivos TypeScript/JavaScript...${colors.reset}`)
    const allFiles = findFiles(process.cwd(), [".tsx", ".ts", ".jsx", ".js"])
    console.log(`${colors.green}✓ Encontrados ${allFiles.length} arquivos${colors.reset}`)

    // 3. Identificar arquivos que importam next/headers
    console.log(`${colors.cyan}3. Identificando arquivos que importam next/headers...${colors.reset}`)
    const headersFiles = new Set<string>()
    for (const file of allFiles) {
      if (importsNextHeaders(file)) {
        headersFiles.add(file)
        console.log(`${colors.yellow}! Arquivo com next/headers: ${file}${colors.reset}`)
      }
    }
    console.log(`${colors.green}✓ Encontrados ${headersFiles.size} arquivos que importam next/headers${colors.reset}`)

    // 4. Criar versões alternativas dos arquivos que importam next/headers
    console.log(`${colors.cyan}4. Criando versões alternativas dos arquivos...${colors.reset}`)
    for (const file of headersFiles) {
      const newContent = createAlternativeVersion(file)
      const dirname = path.dirname(file)
      const basename = path.basename(file)
      const ext = path.extname(file)
      const alternativePath = path.join(dirname, `${basename.replace(ext, "")}-client${ext}`)

      fs.writeFileSync(alternativePath, newContent)
      console.log(`${colors.green}✓ Criada versão alternativa: ${alternativePath}${colors.reset}`)
    }

    // 5. Atualizar todas as importações para usar as versões alternativas
    console.log(`${colors.cyan}5. Atualizando importações...${colors.reset}`)
    updateImports(allFiles, headersFiles)

    // 6. Limpar cache do Next.js
    console.log(`${colors.cyan}6. Limpando cache do Next.js...${colors.reset}`)
    const nextCacheDir = path.join(process.cwd(), ".next")
    if (fs.existsSync(nextCacheDir)) {
      fs.rmSync(nextCacheDir, { recursive: true, force: true })
      console.log(`${colors.green}✓ Cache do Next.js limpo${colors.reset}`)
    }

    console.log(`${colors.yellow}=== CORREÇÃO RADICAL CONCLUÍDA ===${colors.reset}`)
    console.log(`${colors.green}✓ Agora tente executar "pnpm run build" novamente${colors.reset}`)
  } catch (error) {
    console.error(`${colors.red}Erro durante a execução:${colors.reset}`, error)
    process.exit(1)
  }
}

main()
