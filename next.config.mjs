/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração correta para pageExtensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Outras configurações
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'v0-we-game.vercel.app'],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    styledComponents: true,
  },
  // Ignorar a pasta pages/ durante a compilação usando uma abordagem diferente
  webpack: (config, { isServer, defaultLoaders }) => {
    // Adicionar regra para ignorar arquivos na pasta pages/
    config.module.rules.push({
      test: /pages[\\/].*\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader',
    });
    
    return config;
  },
  // Configuração para direcionar o Next.js a usar apenas o App Router
  experimental: {
    appDir: true,
  },
}

export default nextConfig
