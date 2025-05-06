/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  
  // Configuração de imagens
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  
  // Configurações experimentais corrigidas
  experimental: {
    // Corrigido: serverActions deve ser um objeto, não um boolean
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vercel.app']
    }
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
