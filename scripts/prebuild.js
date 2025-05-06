const fs = require("fs")
const path = require("path")

console.log("Executando script de pré-build simplificado...")

// Remover a pasta pages/ se ela existir
if (fs.existsSync("pages")) {
  console.log("Pasta pages/ encontrada. Removendo...")

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

  removeDirectory("pages")
  console.log("Pasta pages/ removida com sucesso!")
} else {
  console.log("Pasta pages/ não encontrada. Nada a fazer.")
}

console.log("Script de pré-build concluído com sucesso!")
