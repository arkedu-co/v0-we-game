const fs = require("fs")
const path = require("path")

// Remover completamente a pasta pages/
const pagesDir = path.join(process.cwd(), "pages")
if (fs.existsSync(pagesDir)) {
  console.log("Removendo pasta pages/ antes do build...")
  fs.rmSync(pagesDir, { recursive: true, force: true })
  console.log("Pasta pages/ removida com sucesso!")
}
