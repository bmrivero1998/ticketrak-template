/**
 * Tipos alineados con el OpenAPI spec de Ticketrak Public API v1.0.0
 */

export interface ResponseApi<T> {
  data: T,
  success: boolean,
  error?: string
}


// ─── EVENTS ──────────────────────────────────────────────────────────────────

export interface EventSummary {
  id: string
  name: string
  venue_name: string
  poster_image_url: string
  start_date: string // ISO 8601
  slug: string
  currency: string // Nuevo campo para la moneda del evento (ej. "MXN", "USD")
  genre?: string // Nuevo campo opcional para el género o categoría del evento
  city?: string // Nuevo campo opcional para la ciudad del evento
  artist_name?: string // Nuevo campo opcional para el nombre del artista principal
  location_address?: string // Nuevo campo opcional para la dirección del evento
  project_id: string // Nuevo campo para el ID del proyecto asociado al evento
}

export interface EventDetail extends EventSummary {
  description: string
  address: string
  map_url: string
}

// ─── TIERS ───────────────────────────────────────────────────────────────────

export interface Tier {
    id: string
    event_id: string
    project_id: string
    name: string
    type: "FIXED" | "FREE" | "DONATION" | "PAID" // ✅ Actualizado para coincidir con tu BD
    stock_total: number
    stock_sold: number
    price_amount: number // En BD se llama price_cents
    min_donation_amount: number // En centavos
    settings: null | {
        donation_enabled: boolean
    }
    created_at: string
}
// ─── ENGINE ──────────────────────────────────────────────────────────────────

export interface ReserveItem {
  tier_id: string
  quantity: number
  donation_amount?: number // ✅ Nuevo campo para la donación (en enteros/pesos o centavos según lo mandes)
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
  project_id: string
  event_id: string
  customer_email: string
  customer_name: string
  contact_phone: string
  items: ReserveItem[]  
  billing_details?: BillingDetails
}


export interface ReserveResponse 
  {
    id: string,
    project_id: string
    event_id: string
    tier_id: string
    customer_email:string
    quantity: number
    session_token: string
    expires_at:string
    processed: number,
    created_at: string,
    contact_phone: string
    customer_name: string
}


export interface CheckoutSessionRequest {
      reservation_id: string;
        project_uuid: string;
        customer_data: {
          email: string;
          name: string;
        }
}

export interface CheckoutSessionResponse {
  url?: string
  sessionId?: string
  clientSecret?: string 
  orderUuid?: string
  isFree?: boolean // ✅ Nuevo campo que manda el backend
  session_token?: string // ✅ Nuevo campo que manda el backend
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
  tier: Tier;
  quantity: number;
  donationAmount?: number;
  currency: string; // 🔥 Nueva propiedad
  project_id: string; // 🔥 Nueva propiedad
  event_id: string; // 🔥 Nueva propiedad
  event_name: string
  event_poster?: string
}

export interface EventDataVault {
    event_id:            string;
    event_name:          string;
    event_slug:          string;
    event_date:          string;
    venue_name:          string;
    poster_image_url:    string;
    ticket_bg_image_url: string;
    status:              string;
    tickets:             Ticket[];
}

export interface TicketVault {
    ticket_id:     string;
    tier_name:     string;
    tier_type:     string;
    secret_token:  string;
    status:        string;
    amount_paid:   number;
    qr_payload:    string;
    gw_saved_link: string;
    created_at:    Date;
}
