import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stfindatableprod.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "findatable-media-staging.ams3.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "findatable-media-production.ams3.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "staging-media.findatable.nl",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.findatable.nl",
        pathname: "/**",
      },
    ],
  },
  sassOptions: {
    silenceDeprecations: [
      "legacy-js-api",
      "mixed-decls",
      "color-functions",
      "global-builtin",
      "import",
    ],
  },
};

export default withNextIntl(nextConfig);
