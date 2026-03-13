import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_REPOSITORY != null;
const basePath = isGitHubPages
  ? `/${process.env.GITHUB_REPOSITORY!.split('/')[1]}`
  : '';
const assetPrefix = basePath ? `${basePath}/` : undefined;

const nextConfig: NextConfig = {
  output: 'export',
  ...(basePath && { basePath }),
  ...(assetPrefix && { assetPrefix }),
};

export default nextConfig;
