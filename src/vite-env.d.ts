/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_PROJECT_ID?: string
  readonly VITE_BRAND_NAME?: string
  readonly VITE_BRAND_TAGLINE?: string
  readonly VITE_LOGO_URL?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_STRIPE_ACCOUNT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
