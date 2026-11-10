/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL

if (process.env.NODE_ENV === "production" && !apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required for production builds (e.g. https://api.example.com/api/v1)",
  )
}

const apiOrigin = (() => {
  try {
    return apiUrl ? new URL(apiUrl).origin : ""
  } catch {
    return ""
  }
})()

const isProd = process.env.NODE_ENV === "production"

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${apiOrigin ? ` ${apiOrigin}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}${isProd ? "" : " ws: http://localhost:*"}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
]

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  typescript: {
    // Prefer fixing types; keep false so CI surfaces regressions.
    ignoreBuildErrors: false,
  },
  images: {
    // Served through the Cloudflare IMAGES binding (wrangler.jsonc) by OpenNext.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
