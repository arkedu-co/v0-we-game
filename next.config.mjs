/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para ignorar completamente a pasta pages/
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => `app/**/*.${ext}`),
  
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
  // Ignorar a pasta pages/ durante a compilação
  webpack: (config, { isServer }) => {
    // Adicionar regra para ignorar a pasta pages/
    config.module.rules.push({
      test: /pages\//,
      loader: 'ignore-loader',
    });
    
    return config;
  },
}

export default nextConfig
