// Este script pode ser executado manualmente para migrar páginas da pasta pages/ para a pasta app/
// Execute com: npx tsx scripts/migrate-pages-to-app.ts

import fs from "fs"
import path from "path"

// Função para criar diretórios recursivamente
function mkdirRecursive(dir: string) {
  if (fs.existsSync(dir)) return

  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (err) {
    console.error(`Erro ao criar diretório ${dir}:`, err)
  }
}

// Função para migrar um arquivo da pasta pages/ para a pasta app/
function migrateFile(filePath: string, projectRoot: string) {
  // Obter o caminho relativo à pasta pages/
  const relativePath = path.relative(path.join(projectRoot, "pages"), filePath)

  // Determinar o novo caminho na pasta app/
  let newPath = path.join(projectRoot, "app", relativePath)

  // Se for um arquivo de página, ajustar o nome
  if (path.basename(filePath).startsWith("index.")) {
    newPath = path.join(path.dirname(newPath), "page" + path.extname(filePath))
  } else if (!path.basename(filePath).startsWith("_") && !path.basename(filePath).includes(".")) {
    // Se não for um arquivo especial e não tiver extensão, é um diretório
    newPath = path.join(newPath, "page" + path.extname(filePath))
  }

  // Criar o diretório de destino
  mkdirRecursive(path.dirname(newPath))

  // Ler o conteúdo do arquivo
  let content = fs.readFileSync(filePath, "utf8")

  // Modificar o conteúdo para ser compatível com o App Router
  content = content
    // Substituir imports de next/router por next/navigation
    .replace(
      /import\s+\{\s*([^}]*useRouter[^}]*)\s*\}\s+from\s+['"]next\/router['"]/g,
      "import { $1 } from 'next/navigation'",
    )
    // Substituir imports de next/head
    .replace(
      /import\s+Head\s+from\s+['"]next\/head['"]/g,
      "// Import removido para compatibilidade com App Router\n// import Head from 'next/head'",
    )
    // Remover componentes Head
    .replace(/<Head>[\s\S]*?<\/Head>/g, "")
    // Adicionar 'use client' no topo do arquivo se não for uma API
    .replace(/^(?!\/\/ API)/, "'use client';\n\n")

  // Escrever o conteúdo no novo arquivo
  fs.writeFileSync(newPath, content)

  console.log(`Migrado: ${path.relative(projectRoot, filePath)} -> ${path.relative(projectRoot, newPath)}`)

  return newPath
}

// Função para migrar recursivamente os arquivos em um diretório
function migrateDirectory(dir: string, projectRoot: string, results: string[] = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Ignorar diretórios especiais
      if (!file.startsWith("_") && file !== "api") {
        migrateDirectory(filePath, projectRoot, results)
      }
    } else if (
      stat.isFile() &&
      (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx"))
    ) {
      // Ignorar arquivos especiais
      if (!file.startsWith("_")) {
        const newPath = migrateFile(filePath, projectRoot)
        results.push(newPath)
      }
    }
  }

  return results
}

// Migrar o projeto
const projectRoot = path.resolve(__dirname, "..")
const pagesDir = path.join(projectRoot, "pages")

if (fs.existsSync(pagesDir)) {
  console.log("Migrando páginas da pasta pages/ para a pasta app/...")
  const results = migrateDirectory(pagesDir, projectRoot)

  console.log("\nMigração concluída!")
  console.log(`${results.length} arquivos migrados.`)

  console.log("\nAgora você pode remover a pasta pages/ ou renomeá-la para pages.bak/")
} else {
  console.log("A pasta pages/ não existe. Nada a migrar.")
}
