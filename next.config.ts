import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // HSTS: browsers go straight to HTTPS after the first visit. Ignored over plain HTTP (localhost).
        source: "/:path*",
        headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }],
      },
    ];
  },
};

export default nextConfig;
