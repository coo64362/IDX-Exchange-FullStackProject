/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  //Frontend works on localhost:3000, and we want to keep it that way, so let's have it change paths.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ]
  },
};

export default nextConfig;
