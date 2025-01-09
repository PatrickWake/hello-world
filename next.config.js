/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true  // Required for static export
  },
  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
  // Add this to ensure proper asset prefixing
  assetPrefix: './',
  basePath: ''
}

export default nextConfig 