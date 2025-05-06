/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar para ignorar o diretório pages/ completamente
  // Isso evitará que o Next.js tente compilar arquivos no diretório pages/
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  
  // Outras configurações
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Garantir que o SWC seja usado
  compiler: {
    styledComponents: true,
  },
}

export default nextConfig
