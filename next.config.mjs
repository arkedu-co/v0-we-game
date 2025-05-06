/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  
  // Configuração de imagens
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  
  // Ignorar erros durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Compilador
  compiler: {
    styledComponents: true,
  }
}

export default nextConfig
