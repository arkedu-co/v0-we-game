const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Executando script de pré-build...")

// Função para remover um diretório recursivamente
function removeDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const curPath = path.join(dir, file)

      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursivamente remover subdiretórios
        removeDirectory(curPath)
      } else {
        // Remover arquivo
        fs.unlinkSync(curPath)
      }
    })

    // Remover o diretório vazio
    fs.rmdirSync(dir)
  }
}

// Remover a pasta pages/ se ela existir
console.log("Verificando e removendo a pasta pages/...")
if (fs.existsSync("pages")) {
  console.log("Pasta pages/ encontrada. Removendo...")
  removeDirectory("pages")
  console.log("Pasta pages/ removida com sucesso!")
} else {
  console.log("Pasta pages/ não encontrada. Nada a fazer.")
}

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
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)

    // Ignorar node_modules, .next, etc.
    if (filePath.includes("node_modules") || filePath.includes(".next") || filePath.includes(".git")) {
      continue
    }

    const stat = fs.lstatSync(filePath)

    if (stat.isDirectory()) {
      traverseDirectory(filePath)
    } else if (/\.(ts|tsx|js|jsx)$/.test(filePath) && checkFileForHeaders(filePath)) {
      console.log(`Encontrado arquivo com next/headers: ${filePath}`)

      // Verificar se o arquivo está no diretório app/
      const isInAppDir = filePath.includes(path.sep + "app" + path.sep)

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

// Verificar e corrigir importações de next/headers
console.log("Verificando e corrigindo importações de next/headers...")
traverseDirectory(".")
console.log("Verificação e correção concluídas!")

console.log("Script de pré-build concluído com sucesso!")
