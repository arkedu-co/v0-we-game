// Limpar pasta pages/ para evitar erros de compilação
const fs = require("fs")
const path = require("path")

const pagesDir = path.join(process.cwd(), "pages")
if (fs.existsSync(pagesDir)) {
  // Manter apenas .gitkeep e _app.js
  const files = fs.readdirSync(pagesDir)
  for (const file of files) {
    if (file !== ".gitkeep" && file !== "_app.js") {
      const filePath = path.join(pagesDir, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true })
      } else {
        fs.unlinkSync(filePath)
      }
    }
  }
  console.log("✅ Pasta pages/ limpa")
} else {
  fs.mkdirSync(pagesDir, { recursive: true })
  fs.writeFileSync(path.join(pagesDir, ".gitkeep"), "")
  console.log("✅ Pasta pages/ criada")
}

// Criar _app.js se não existir
const appPath = path.join(pagesDir, "_app.js")
if (!fs.existsSync(appPath)) {
  const appContent = `// Este arquivo existe apenas para evitar erros de compilação
// A aplicação usa exclusivamente o App Router
export default function App() {
  return null;
}`
  fs.writeFileSync(appPath, appContent)
  console.log("✅ Arquivo _app.js criado")
}

console.log("✅ Prebuild concluído")
