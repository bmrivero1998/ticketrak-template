/**
 * ============================================================
 * TICKETRAK — CONFIG.TS
 * Configuración central del cliente público.
 * Edita estos valores para personalizar tu instancia.
 * ============================================================
 */

export const CONFIG = {
  // ----------------------------------------------------------
  // API
  // ----------------------------------------------------------
  /** URL base de la API de Ticketrak. Sin trailing slash. */
  API_URL:'https://api.ticketrak.com',

  // ----------------------------------------------------------
  // PROYECTO
  // ----------------------------------------------------------
  /**
   * UUID del proyecto asociado a esta instancia.
   * Se usa para filtrar los eventos de la cartelera.
   * Puedes sobreescribirlo con VITE_PROJECT_ID en .env
   */
  PROJECT_ID: '',

  // ----------------------------------------------------------
  // BRANDING
  // ----------------------------------------------------------
  /** Nombre que aparece en el header y en el <title> */
  BRAND_NAME:'Ticketrak',

  /** Tagline del hero en la cartelera */
  BRAND_TAGLINE:'Vive la experiencia.',

  /** URL del logo (svg/png). Si está vacío se usa el nombre en texto. */
  LOGO_URL: '',

  // ----------------------------------------------------------
  // RUTAS DE RETORNO (usadas en checkout de Stripe)
  // ----------------------------------------------------------
  /** URL base del sitio — usada para construir success_url y cancel_url */
  SITE_URL: 'http://localhost:5173',

  // ----------------------------------------------------------
  // RESERVA
  // ----------------------------------------------------------
  /** Tiempo en minutos que dura el bloqueo de reserva (informativo, el backend lo define) */
  RESERVATION_TTL_MINUTES: 10,

  /** Máximo de boletos por transacción */
  MAX_TICKETS_PER_ORDER: 10,

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  /** Moneda para formateo de precios en pantalla */
  CURRENCY: 'MXN',

  /** Locale para Intl.NumberFormat */
  LOCALE: 'es-MX',

  // ----------------------------------------------------------
  // FEATURE FLAGS
  // ----------------------------------------------------------
  /** Muestra el botón "Mis Boletos" (vault) en el header */
  ENABLE_VAULT: false,

  /** Muestra eventos pasados en la cartelera */
  SHOW_PAST_EVENTS: false,

  // ----------------------------------------------------------
  // MISC
  // ----------------------------------------------------------
  /** URL de la API de Stripe. Usada en checkout */
  PUBLIC_KEY: 'pk_test_xxxxxxxxxxxxxxxxx',


} as const

/** Helper: formatea centavos a moneda local */
export const formatCurrency = (cents: number): string =>
  new Intl.NumberFormat(CONFIG.LOCALE, {
    style: 'currency',
    currency: CONFIG.CURRENCY,
    minimumFractionDigits: 0,
  }).format(cents / 100)

/** Helper: formatea fecha ISO a legible en español */
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat(CONFIG.LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

/** Helper: formatea fecha corta (para cards) */
export const formatDateShort = (iso: string): string =>
  new Intl.DateTimeFormat(CONFIG.LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
