const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")

console.log("Executando script de pré-build...")

// Executar o script de remoção do diretório pages/
try {
  console.log("Removendo diretório pages/...")
  require("./remove-pages-directory")
} catch (error) {
  console.error("Erro ao remover diretório pages/:", error)
}

console.log("Script de pré-build concluído.")
