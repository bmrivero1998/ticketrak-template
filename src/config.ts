/**
* ============================================================
* TICKETRAK — CONFIG.TS
* Configuración central del cliente público (Widget Mode).
* ============================================================
*/

// Permite que sistemas externos (WP, PHP, Angular) sobreescriban la config
const win = window as any;
const externalConfig = win.TICKETRAK_CONFIG || {};
const env = import.meta.env;

export const CONFIG = {
 // ----------------------------------------------------------
 // API & PROYECTO
 // ----------------------------------------------------------
 API_URL: externalConfig.API_URL || env.VITE_API_URL || 'https://metritrak-workers.kripto-bmrp.workers.dev/v1',
 PROJECT_ID: externalConfig.PROJECT_ID || env.VITE_PROJECT_ID || '174d380b-86a6-4d1f-999b-2bafc81a51e0',

 // ----------------------------------------------------------
 // BRANDING & THEME (Shadow DOM Friendly)
 // ----------------------------------------------------------
 BRAND_NAME: externalConfig.BRAND_NAME || 'Ticketrak',
 BRAND_TAGLINE: externalConfig.BRAND_TAGLINE || 'Vive la experiencia.',
 LOGO_URL: externalConfig.LOGO_URL || '',

 // Variables de color para Bootstrap
 THEME: {
  PRIMARY: externalConfig.PRIMARY_COLOR || '#124cb8',
  SECONDARY: externalConfig.SECONDARY_COLOR || '#e6e6e6',
  BACKGROUND: externalConfig.BG_COLOR || '#000000',
  TEXT: externalConfig.TEXT_COLOR || '#caccce',
  TEXT_SECONDARY: externalConfig.TEXT_SECONDARY || '#9c9d9e'
 },

 // ----------------------------------------------------------
 // UI & LOCALIZACIÓN
 // ----------------------------------------------------------
 CURRENCY: externalConfig.CURRENCY || 'MXN',
 LOCALE:externalConfig.LOCALE || 'es-MX',
 RESERVATION_TTL_MINUTES: externalConfig.RESERVATION_TTL_MINUTES || 10,
 MAX_TICKETS_PER_ORDER: externalConfig.MAX_TICKETS_PER_ORDER || 10,
 MAX_FREE_TICKETS: externalConfig.MAX_FREE_TICKETS || 1,
 // ----------------------------------------------------------
 // STRIPE & CHECKOUT
 // ----------------------------------------------------------
 SITE_URL: externalConfig.SITE_URL || env.VITE_SITE_URL || 'http://localhost:5173',
 PUBLIC_KEY: externalConfig.PUBLIC_KEY || env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51Rjrn9Q7rhLBuE2WtlgmxYdM1qYMuku9y7fNTBq5VblSsqzxOJyxeCVrByrnJkzYGbtTUFnlV3JjcaEn3657hm6000X2SBZZ4O',
 STRIPE_ACCOUNT: externalConfig.STRIPE_ACCOUNT || env.VITE_STRIPE_ACCOUNT || 'acct_1SueuhQ7rhbnDgY2',

 // ----------------------------------------------------------
 // FEATURE FLAGS
 // ----------------------------------------------------------
 ENABLE_VAULT: false,
 SHOW_PAST_EVENTS: externalConfig.SHOW_PAST_EVENTS || false,

 ROUTE_PAGE: externalConfig.ROUTE_PAGE || 'shop'
} as const;

/** Helper: formatea centavos a moneda local */
export const formatCurrency = (cents: number): string =>
 new Intl.NumberFormat(CONFIG.LOCALE, {
  style: 'currency',
  currency: CONFIG.CURRENCY,
  minimumFractionDigits: 0,
 }).format(cents / 100);

/** Helper: formatea fecha ISO a legible en español */
export const formatDate = (iso: string): string =>
 new Intl.DateTimeFormat(CONFIG.LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
 }).format(new Date(iso));

/** Helper: formatea fecha corta (para cards) */
export const formatDateShort = (iso: string): string =>
 new Intl.DateTimeFormat(CONFIG.LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
 }).format(new Date(iso));


 export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',   // jue
    day: '2-digit',     // 26
    month: 'short',     // mar
    year: 'numeric',    // 2026
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}