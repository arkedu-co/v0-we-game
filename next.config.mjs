/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Adicionar configuração para tratar a página inicial corretamente
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
