import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env:{
    NEXT_PUBLIC_API_URL: 'http://localhost:3003',
  }
};

export default nextConfig;
