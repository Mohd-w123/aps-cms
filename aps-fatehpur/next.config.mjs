// Sanitize HOSTNAME for LiteSpeed / Hostinger environments:
// LiteSpeed injects socket path into HOSTNAME, which causes `getaddrinfo ENOTFOUND` in Next.js
if (process.env.HOSTNAME && (process.env.HOSTNAME.startsWith("/") || process.env.HOSTNAME.includes(".sock"))) {
  process.env.HOSTNAME = "0.0.0.0";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
