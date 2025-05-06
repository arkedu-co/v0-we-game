import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

// Caminho para o diretório pages/
const pagesDir = path.join(rootDir, "pages")

// Função para remover um diretório recursivamente
function removeDirectory(dir: string): void {
  if (fs.existsSync(dir)) {
    console.log(`Removendo diretório: ${dir}`)

    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        removeDirectory(filePath)
      } else {
        fs.unlinkSync(filePath)
        console.log(`Arquivo removido: ${filePath}`)
      }
    }

    fs.rmdirSync(dir)
    console.log(`Diretório removido: ${dir}`)
  } else {
    console.log(`Diretório não encontrado: ${dir}`)
  }
}

// Remover o diretório pages/
console.log("Iniciando remoção do diretório pages/...")
removeDirectory(pagesDir)
console.log("Remoção concluída!")
