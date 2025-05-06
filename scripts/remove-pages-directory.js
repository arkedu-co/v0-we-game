const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Função para verificar se o diretório existe
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
  } catch (err) {
    return false
  }
}

// Função para remover um diretório recursivamente
function removeDirectory(dirPath) {
  if (!directoryExists(dirPath)) {
    console.log(`Diretório ${dirPath} não existe, nada a fazer.`)
    return
  }

  console.log(`Removendo diretório ${dirPath}...`)

  try {
    // Em sistemas Unix/Linux/Mac
    if (process.platform === "win32") {
      // Windows
      execSync(`rmdir /s /q "${dirPath}"`, { stdio: "inherit" })
    } else {
      // Unix/Linux/Mac
      execSync(`rm -rf "${dirPath}"`, { stdio: "inherit" })
    }
    console.log(`Diretório ${dirPath} removido com sucesso.`)
  } catch (error) {
    console.error(`Erro ao remover diretório ${dirPath}:`, error)
    // Tentar método alternativo com fs
    try {
      fs.rmdirSync(dirPath, { recursive: true })
      console.log(`Diretório ${dirPath} removido com sucesso (método alternativo).`)
    } catch (fsError) {
      console.error(`Erro ao remover diretório ${dirPath} (método alternativo):`, fsError)
    }
  }
}

// Caminho para o diretório pages/
const pagesDir = path.join(process.cwd(), "pages")

// Remover o diretório pages/
removeDirectory(pagesDir)

console.log("Script de remoção do diretório pages/ concluído.")
