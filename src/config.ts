/**
* ============================================================
* TICKETRAK — CONFIG.TS
* Configuración central del cliente público (Widget Mode).
* ============================================================
*/

// Permite que sistemas externos (WP, PHP, Angular) sobreescriban la config
const win = window as any;
const externalConfig = win.TICKETRAK_CONFIG || {};

export const CONFIG = {
 // ----------------------------------------------------------
 // API & PROYECTO
 // ----------------------------------------------------------
 API_URL: externalConfig.API_URL || 'https://metritrak-workers.kripto-bmrp.workers.dev/v1',
 PROJECT_ID: externalConfig.PROJECT_ID || '254a0c48-7f00-4f62-bcc1-b0febed2965e',
 STRIPE_PUBLIC_KEY: 'pk_test_51Rjrn9Q7rhLBuE2WtlgmxYdM1qYMuku9y7fNTBq5VblSsqzxOJyxeCVrByrnJkzYGbtTUFnlV3JjcaEn3657hm6000X2SBZZ4O',
 STRIPE_ACCOUNT_ID: 'acct_1SueuhQ7rhbnDgY2',

 // ----------------------------------------------------------
 // BRANDING & THEME (Shadow DOM Friendly)
 // ----------------------------------------------------------
 BRAND_NAME: externalConfig.BRAND_NAME || 'Hadadanza ',
 BRAND_TAGLINE: externalConfig.BRAND_TAGLINE || 'Vive la experiencia.',
 LOGO_URL: externalConfig.LOGO_URL || '/images/logotipo.png',

 // Variables de color para Bootstrap
 THEME: {
  PRIMARY: externalConfig.PRIMARY_COLOR || '#FF5A1F',
  SECONDARY: externalConfig.SECONDARY_COLOR || '#F2F2F2',
  BACKGROUND: externalConfig.BG_COLOR || '#0B0B0B',
  TEXT: externalConfig.TEXT_COLOR || '#F2F2F2',
  TEXT_SECONDARY: externalConfig.TEXT_SECONDARY || '#FF5A1F'
 },

 // ----------------------------------------------------------
 // UI & LOCALIZACIÓN
 // ----------------------------------------------------------
 CURRENCY: externalConfig.CURRENCY || 'EUR',
 LOCALE:externalConfig.LOCALE || 'es-ES',
 RESERVATION_TTL_MINUTES: externalConfig.RESERVATION_TTL_MINUTES || 10,
 MAX_TICKETS_PER_ORDER: externalConfig.MAX_TICKETS_PER_ORDER || 10,
 MAX_FREE_TICKETS: externalConfig.MAX_FREE_TICKETS || 1,
 // ----------------------------------------------------------
 // STRIPE & CHECKOUT
 // ----------------------------------------------------------
 SITE_URL: externalConfig.SITE_URL || 'http://hadadanza.metritrak.com',
 PUBLIC_KEY: externalConfig.PUBLIC_KEY || 'pk_test_51Rjrn9Q7rhLBuE2WtlgmxYdM1qYMuku9y7fNTBq5VblSsqzxOJyxeCVrByrnJkzYGbtTUFnlV3JjcaEn3657hm6000X2SBZZ4O',
 STRIPE_ACCOUNT: externalConfig.STRIPE_ACCOUNT || 'acct_1SueuhQ7rhbnDgY2',

 // ----------------------------------------------------------
 // FEATURE FLAGS
 // ----------------------------------------------------------
 ENABLE_VAULT: false,
 SHOW_PAST_EVENTS: externalConfig.SHOW_PAST_EVENTS || false,

 ROUTE_PAGE: externalConfig.ROUTE_PAGE || 'tickets'
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