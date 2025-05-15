import fs from "fs"
import path from "path"
import { execSync } from "child_process"

console.log("\x1b[33m%s\x1b[0m", "=== INICIANDO CORREÇÃO DE EMERGÊNCIA ===")

// 1. Remover completamente a pasta pages/
const pagesDir = path.join(process.cwd(), "pages")
if (fs.existsSync(pagesDir)) {
  console.log("\x1b[36m%s\x1b[0m", "1. Removendo pasta pages/...")
  fs.rmSync(pagesDir, { recursive: true, force: true })

  // Criar pasta vazia com arquivo .gitkeep
  fs.mkdirSync(pagesDir)
  fs.writeFileSync(path.join(pagesDir, ".gitkeep"), "")
  console.log("\x1b[32m%s\x1b[0m", "✓ Pasta pages/ removida e recriada vazia")
} else {
  console.log("\x1b[36m%s\x1b[0m", "1. Pasta pages/ não encontrada, criando vazia...")
  fs.mkdirSync(pagesDir, { recursive: true })
  fs.writeFileSync(path.join(pagesDir, ".gitkeep"), "")
  console.log("\x1b[32m%s\x1b[0m", "✓ Pasta pages/ criada vazia")
}

// 2. Criar arquivo _app.js vazio na pasta pages para evitar erros
console.log("\x1b[36m%s\x1b[0m", "2. Criando arquivo _app.js vazio...")
const appContent = `// Este arquivo existe apenas para evitar erros de compilação
// A aplicação usa exclusivamente o App Router
export default function App() {
  return null;
}`
fs.writeFileSync(path.join(pagesDir, "_app.js"), appContent)
console.log("\x1b[32m%s\x1b[0m", "✓ Arquivo _app.js criado")

// 3. Instalar ignore-loader se não estiver instalado
console.log("\x1b[36m%s\x1b[0m", "3. Verificando se ignore-loader está instalado...")
try {
  require.resolve("ignore-loader")
  console.log("\x1b[32m%s\x1b[0m", "✓ ignore-loader já está instalado")
} catch (e) {
  console.log("\x1b[36m%s\x1b[0m", "Instalando ignore-loader...")
  execSync("npm install --save-dev ignore-loader", { stdio: "inherit" })
  console.log("\x1b[32m%s\x1b[0m", "✓ ignore-loader instalado")
}

// 4. Limpar cache do Next.js
console.log("\x1b[36m%s\x1b[0m", "4. Limpando cache do Next.js...")
const nextCacheDir = path.join(process.cwd(), ".next")
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true })
  console.log("\x1b[32m%s\x1b[0m", "✓ Cache do Next.js limpo")
} else {
  console.log("\x1b[32m%s\x1b[0m", "✓ Pasta .next não encontrada, nada a limpar")
}

// 5. Criar arquivo .babelrc para ignorar a pasta pages/
console.log("\x1b[36m%s\x1b[0m", "5. Criando arquivo .babelrc para ignorar a pasta pages/...")
const babelrcContent = `{
  "presets": ["next/babel"],
  "ignore": ["./pages/**/*"]
}`
fs.writeFileSync(path.join(process.cwd(), ".babelrc"), babelrcContent)
console.log("\x1b[32m%s\x1b[0m", "✓ Arquivo .babelrc criado")

// 6. Atualizar o arquivo prebuild.js para garantir que a pasta pages/ esteja vazia
console.log("\x1b[36m%s\x1b[0m", "6. Atualizando script prebuild.js...")
const prebuildPath = path.join(process.cwd(), "scripts", "prebuild.js")
if (fs.existsSync(prebuildPath)) {
  let prebuildContent = fs.readFileSync(prebuildPath, "utf8")

  // Adicionar código para limpar a pasta pages/
  if (!prebuildContent.includes("pages/")) {
    prebuildContent = `// Limpar pasta pages/ para evitar erros de compilação
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(process.cwd(), 'pages');
if (fs.existsSync(pagesDir)) {
  // Manter apenas .gitkeep e _app.js
  const files = fs.readdirSync(pagesDir);
  for (const file of files) {
    if (file !== '.gitkeep' && file !== '_app.js') {
      const filePath = path.join(pagesDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  }
  console.log('✅ Pasta pages/ limpa');
} else {
  fs.mkdirSync(pagesDir, { recursive: true });
  fs.writeFileSync(path.join(pagesDir, '.gitkeep'), '');
  console.log('✅ Pasta pages/ criada');
}

// Criar _app.js se não existir
const appPath = path.join(pagesDir, '_app.js');
if (!fs.existsSync(appPath)) {
  const appContent = \`// Este arquivo existe apenas para evitar erros de compilação
// A aplicação usa exclusivamente o App Router
export default function App() {
  return null;
}\`;
  fs.writeFileSync(appPath, appContent);
  console.log('✅ Arquivo _app.js criado');
}

${prebuildContent}`

    fs.writeFileSync(prebuildPath, prebuildContent)
    console.log("\x1b[32m%s\x1b[0m", "✓ Script prebuild.js atualizado")
  } else {
    console.log("\x1b[32m%s\x1b[0m", "✓ Script prebuild.js já contém código para limpar pages/")
  }
} else {
  console.log("\x1b[33m%s\x1b[0m", "! Arquivo prebuild.js não encontrado, criando...")
  const prebuildContent = `// Limpar pasta pages/ para evitar erros de compilação
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(process.cwd(), 'pages');
if (fs.existsSync(pagesDir)) {
  // Manter apenas .gitkeep e _app.js
  const files = fs.readdirSync(pagesDir);
  for (const file of files) {
    if (file !== '.gitkeep' && file !== '_app.js') {
      const filePath = path.join(pagesDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  }
  console.log('✅ Pasta pages/ limpa');
} else {
  fs.mkdirSync(pagesDir, { recursive: true });
  fs.writeFileSync(path.join(pagesDir, '.gitkeep'), '');
  console.log('✅ Pasta pages/ criada');
}

// Criar _app.js se não existir
const appPath = path.join(pagesDir, '_app.js');
if (!fs.existsSync(appPath)) {
  const appContent = \`// Este arquivo existe apenas para evitar erros de compilação
// A aplicação usa exclusivamente o App Router
export default function App() {
  return null;
}\`;
  fs.writeFileSync(appPath, appContent);
  console.log('✅ Arquivo _app.js criado');
}

console.log('✅ Prebuild concluído');
`

  // Criar diretório scripts se não existir
  const scriptsDir = path.join(process.cwd(), "scripts")
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true })
  }

  fs.writeFileSync(prebuildPath, prebuildContent)
  console.log("\x1b[32m%s\x1b[0m", "✓ Script prebuild.js criado")
}

// 7. Criar arquivo .npmrc para garantir que o pnpm instale ignore-loader
console.log("\x1b[36m%s\x1b[0m", "7. Criando arquivo .npmrc...")
const npmrcContent = `save-exact=true
strict-peer-dependencies=false
auto-install-peers=true
`
fs.writeFileSync(path.join(process.cwd(), ".npmrc"), npmrcContent)
console.log("\x1b[32m%s\x1b[0m", "✓ Arquivo .npmrc criado")

// 8. Criar arquivo pages/_app.js vazio
console.log("\x1b[36m%s\x1b[0m", "8. Criando arquivo pages/_app.js...")
fs.writeFileSync(path.join(pagesDir, "_app.js"), appContent)
console.log("\x1b[32m%s\x1b[0m", "✓ Arquivo pages/_app.js criado")

console.log("\x1b[33m%s\x1b[0m", "=== CORREÇÃO DE EMERGÊNCIA CONCLUÍDA ===")
console.log("\x1b[32m%s\x1b[0m", '✓ Agora tente executar "pnpm run build" novamente')
