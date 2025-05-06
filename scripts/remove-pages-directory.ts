import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Função para remover um diretório recursivamente
function removeDirectory(dir: string) {
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

// Caminho para o diretório pages/
const pagesDir = path.join(process.cwd(), "pages")

console.log("Verificando se o diretório pages/ existe...")

if (fs.existsSync(pagesDir)) {
  console.log("Diretório pages/ encontrado. Removendo...")

  try {
    removeDirectory(pagesDir)
    console.log("Diretório pages/ removido com sucesso!")
  } catch (error) {
    console.error("Erro ao remover diretório pages/:", error)
    process.exit(1)
  }
} else {
  console.log("Diretório pages/ não encontrado. Nada a fazer.")
}

// Verificar se há referências a next/headers em arquivos fora do diretório app/
console.log("Verificando referências a next/headers em arquivos...")

try {
  // Usar grep para encontrar arquivos com importações de next/headers
  const grepCommand =
    'grep -r "next/headers" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "node_modules" | grep -v ".next"'
  const grepResult = execSync(grepCommand, { encoding: "utf8" })

  console.log("Arquivos com referências a next/headers:")
  console.log(grepResult)

  console.log("Por favor, modifique esses arquivos para usar alternativas compatíveis a next/headers.")
} catch (error) {
  // grep retorna código de erro 1 quando não encontra nada
  console.log("Nenhuma referência a next/headers encontrada fora do diretório app/.")
}

console.log("Script concluído.")
