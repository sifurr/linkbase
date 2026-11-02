import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Emit a self-contained `.next/standalone` server for the production Docker
  // image (see `Dockerfile`). Vercel ignores this and uses its own build
  // output, so it is safe to keep on for both targets.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Baseline security headers applied to every response (`docs/security.md` §2).
  // A full Content-Security-Policy is a deliberate follow-up — it needs auditing
  // against Next's inline styles/scripts to avoid breaking the app.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
