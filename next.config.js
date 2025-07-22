/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Handle .langium files
    config.module.rules.push({
      test: /\.langium$/,
      use: 'raw-loader'
    });

    // Explicitly mark langium packages as external in server build
    if (isServer) {
      config.externals.push('vscode-languageserver', 'vscode-languageclient');
    }

    return config;
  },
  // Ensure Next.js knows about our custom file types
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = nextConfig;
