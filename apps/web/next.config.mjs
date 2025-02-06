import CopyPlugin from 'copy-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:false,
  webpack(config, { isServer }) {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 200000,  // 200 KB (adjust as needed)
    },
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/@rdkit/rdkit/dist/RDKit_minimal.wasm",
            to: "static/chunks"
          }
        ]
      })
    );

    if (!isServer) {
      config.resolve.fallback = {
        fs: false
      };
    }

    return config;
  }
};

export default nextConfig;
