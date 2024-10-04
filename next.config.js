/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['head.agenciaplanner.dev'],
  },

  webpack(config) {
    config.resolve.fallback = {
      // se você esquecer, todas as outras opções em fallback, especificadas
      // pelo next.js serão removidas.
      ...config.resolve.fallback,  

      fs: false, // a solução
    };
    
    return config;
  },
};

module.exports = nextConfig;
