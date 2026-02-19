import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk', 'openai', 'fs', 'path'],
};

export default nextConfig;
