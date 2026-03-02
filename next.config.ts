// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingIncludes: {
    "*": ["node_modules/.prisma/client/**"],
  },
};

module.exports = nextConfig;
