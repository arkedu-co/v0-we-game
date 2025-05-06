/** @type {import('next').NextConfig} */
const nextConfig = {
  // Em vez de usar um array vazio ou filtrar para um array vazio,
  // vamos usar extensões que não existem no nosso projeto
  pageExtensions: ['nonexistent'],
  
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
