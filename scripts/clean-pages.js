const fs = require("fs")
const path = require("path")

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

// Função para criar um diretório se não existir
function createDirectoryIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

// Remover a pasta pages/ se ela existir
console.log("Verificando e removendo a pasta pages/...")
if (fs.existsSync("pages")) {
  console.log("Pasta pages/ encontrada. Removendo...")
  removeDirectory("pages")
  console.log("Pasta pages/ removida com sucesso!")
}

// Criar a pasta pages/ vazia com um arquivo README.md
console.log("Criando pasta pages/ vazia...")
createDirectoryIfNotExists("pages")

// Criar um arquivo README.md na pasta pages/
fs.writeFileSync(
  path.join("pages", "README.md"),
  "# pages/\n\nEste diretório está vazio e é mantido apenas para compatibilidade.\nTodo o código da aplicação está no diretório app/.\n",
)

console.log("Pasta pages/ criada com README.md.")
console.log("Script de limpeza concluído com sucesso!")
