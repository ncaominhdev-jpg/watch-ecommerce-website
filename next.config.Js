/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/trang-chu",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
