/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remover a configuração pageExtensions que está causando problemas
  // Usar as extensões padrão do Next.js
  
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
