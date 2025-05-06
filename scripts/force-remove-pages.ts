import fs from "fs"
import path from "path"
import { execSync } from "child_process"

console.log("Iniciando remoção forçada da pasta pages/...")

// Verificar se a pasta pages/ existe
if (fs.existsSync("pages")) {
  console.log("Pasta pages/ encontrada. Removendo...")

  try {
    // Remover a pasta pages/ usando rm -rf para garantir a remoção completa
    execSync("rm -rf pages", { stdio: "inherit" })
    console.log("Pasta pages/ removida com sucesso!")
  } catch (error) {
    console.error("Erro ao remover a pasta pages/:", error)

    // Abordagem alternativa usando fs
    console.log("Tentando abordagem alternativa...")

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

    // Remover a pasta pages/
    removeDirectory("pages")
    console.log("Pasta pages/ removida com sucesso (abordagem alternativa)!")
  }
} else {
  console.log("Pasta pages/ não encontrada. Nada a fazer.")
}

// Criar um arquivo .gitkeep vazio na pasta pages/ para garantir que o Git a ignore
console.log("Criando pasta pages/ vazia com .gitkeep...")

try {
  // Criar a pasta pages/ se ela não existir
  if (!fs.existsSync("pages")) {
    fs.mkdirSync("pages")
  }

  // Criar um arquivo .gitkeep vazio
  fs.writeFileSync("pages/.gitkeep", "")

  // Criar um arquivo README.md explicativo
  fs.writeFileSync(
    "pages/README.md",
    "# Pages Directory\n\nThis directory is intentionally kept empty.\nThe application uses the App Router exclusively.\n",
  )

  console.log("Arquivos criados com sucesso!")
} catch (error) {
  console.error("Erro ao criar arquivos:", error)
}

console.log("Processo concluído!")
