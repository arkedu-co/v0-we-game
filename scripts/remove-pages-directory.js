const fs = require("fs")
const path = require("path")

console.log("Iniciando remoção do diretório pages/...")

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

// Verificar se o diretório pages/ existe
if (fs.existsSync("pages")) {
  console.log("Diretório pages/ encontrado. Removendo...")
  removeDirectory("pages")
  console.log("Diretório pages/ removido com sucesso!")
} else {
  console.log("Diretório pages/ não encontrado. Nada a fazer.")
}

console.log("Processo de remoção concluído.")
