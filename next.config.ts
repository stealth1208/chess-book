import type { NextConfig } from 'next';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const requiredPwaAssets = ['manifest.json', 'sw.js'];

function validatePwaAssets(): void {
  for (const asset of requiredPwaAssets) {
    const fullPath = join(process.cwd(), 'public', asset);
    if (!existsSync(fullPath)) {
      console.warn(`[pwa] Missing expected asset: public/${asset}`);
    }
  }
}

validatePwaAssets();

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
