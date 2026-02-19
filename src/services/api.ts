/**
 * Cliente HTTP de Ticketrak Public API
 * Todos los endpoints están alineados con el OpenAPI spec v1.0.0
 */

import { CONFIG } from '@/config'
import type {
  EventSummary,
  EventDetail,
  Tier,
  ReserveRequest,
  ReserveResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CheckoutSessionStatus,
  Ticket,
} from '@/types'

// ─── ENGINE ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${CONFIG.API_URL}${path}`

  const headers = new Headers(options.headers ?? {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Fan auth token (vault)
  const fanToken = sessionStorage.getItem('fan_token')
  if (fanToken) headers.set('Authorization', `Bearer ${fanToken}`)

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? err.message ?? `Error ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

/**
 * GET /tr/events
 * Lista eventos públicos del proyecto configurado.
 * La respuesta devuelve { events: EventSummary[] }
 */
export async function getEvents(): Promise<EventSummary[]> {
  const params = new URLSearchParams()
  if (CONFIG.PROJECT_ID) params.set('project_id', CONFIG.PROJECT_ID)
  if (!CONFIG.SHOW_PAST_EVENTS) params.set('status', 'active')

  const data = await request<{ events: EventSummary[] }>(`/tr/events?${params.toString()}`)
  return data.events
}

/**
 * GET /tr/events/:id
 * Detalle de un evento.
 * La respuesta devuelve { event: EventDetail }
 */
export async function getEvent(id: string): Promise<EventDetail> {
  const data = await request<{ event: EventDetail }>(`/tr/events/${id}`)
  return data.event
}

/**
 * GET /tr/events/:id/tiers
 * Tiers (zonas/precios) con disponibilidad en tiempo real.
 * La respuesta devuelve { tiers: Tier[] }
 */
export async function getEventTiers(eventId: string): Promise<Tier[]> {
  const data = await request<{ tiers: Tier[] }>(`/tr/events/${eventId}/tiers`)
  return data.tiers
}

// ─── ENGINE ──────────────────────────────────────────────────────────────────

/**
 * POST /tr/engine/reserve
 * Bloquea inventario y retorna reservation_id + total + expires_at
 */
export async function createReservation(payload: ReserveRequest): Promise<ReserveResponse> {
  return request<ReserveResponse>('/tr/engine/reserve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * POST /tr/engine/checkout/session
 * Genera sesión de Stripe. Retorna { url, sessionId }
 */
export async function createCheckoutSession(
  payload: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  return request<CheckoutSessionResponse>('/tr/engine/checkout/session', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * GET /tr/engine/checkout/session/:sessionId
 * Verifica el estado del pago (used en página de Gracias).
 */
export async function getCheckoutStatus(sessionId: string): Promise<CheckoutSessionStatus> {
  return request<CheckoutSessionStatus>(`/tr/engine/checkout/session/${sessionId}`)
}

// ─── VAULT ───────────────────────────────────────────────────────────────────

/**
 * POST /tr/vault/request-code
 * Solicita OTP al correo del fan.
 */
export async function requestVaultCode(email: string): Promise<void> {
  await request('/tr/vault/request-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/**
 * POST /tr/vault/login
 * Login con OTP. Guarda el token en sessionStorage.
 */
export async function vaultLogin(
  email: string,
  code: string,
): Promise<{ token: string; user: { email: string; name: string } }> {
  const data = await request<{ token: string; user: { email: string; name: string } }>(
    '/tr/vault/login',
    { method: 'POST', body: JSON.stringify({ email, code }) },
  )
  sessionStorage.setItem('fan_token', data.token)
  return data
}

/**
 * GET /tr/vault/tickets
 * Retorna { event: EventSummary, tickets: Ticket[] }
 * Requiere Authorization header (fan_token en sessionStorage).
 */
export async function getMyTickets(): Promise<{ event: EventSummary; tickets: Ticket[] }> {
  return request<{ event: EventSummary; tickets: Ticket[] }>('/tr/vault/tickets')
}
