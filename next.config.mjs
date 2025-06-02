/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [new URL("https://files.tfgsolutions.pk/**")],
  },
};

export default nextConfig;
