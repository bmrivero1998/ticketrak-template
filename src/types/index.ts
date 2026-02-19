/**
 * Tipos alineados con el OpenAPI spec de Ticketrak Public API v1.0.0
 */

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export interface EventSummary {
  id: string
  name: string
  venue_name: string
  poster_url: string
  start_date: string // ISO 8601
}

export interface EventDetail extends EventSummary {
  description: string
  address: string
  map_url: string
}

// ─── TIERS ───────────────────────────────────────────────────────────────────

export interface Tier {
  id: string
  name: string
  price_cents: number
  capacity: number
  available: number
  description?: string
}

// ─── ENGINE ──────────────────────────────────────────────────────────────────

export interface ReserveItem {
  tier_id: string
  quantity: number
}

/**
 * Detalle de facturación opcional para la reserva
 */
export interface BillingDetails {
  tax_id: string       // RFC
  legal_name: string   // Razón Social
  postal_code: string
  address: string      // Calle y número
  neighborhood: string // Colonia
  city: string         // Ciudad/Municipio
  state: string        // Estado
  tax_system?: string  // Régimen Fiscal (Opcional)
}

export interface ReserveRequest {
  event_id: string
  customer_email: string
  items: ReserveItem[]
  billing_details?: BillingDetails
}

export interface ReserveResponse {
  reservation_id: string
  total_cents: number
  expires_at: string // ISO 8601
}

export interface CheckoutSessionRequest {
  reservation_id: string
  success_url: string
  cancel_url: string
}

export interface CheckoutSessionResponse {
  url: string
  sessionId: string
  client_secret?: string // Necesario para Stripe Embedded Checkout
}

export interface CheckoutSessionStatus {
  status: 'complete' | 'open' | 'expired'
  customer_email: string
  order_id: string
}

// ─── TICKETS ─────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string
  tier_name: string
  status: 'ACTIVE' | 'USED' | 'REVOKED'
  seat_label?: string
  qr_data: string
}

// ─── CART (estado local — no viene del API) ───────────────────────────────────

export interface CartItem {
  tier: Tier
  quantity: number
}