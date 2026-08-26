/**
 * Cliente HTTP de Ticketrak Public API
 * Centraliza la comunicación con Marketplace, Engine y Vault.
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
  ResponseApi,
  TicketRefundRequest,
  Aclaracion,
} from '@/types'

// ─── CORE REQUEST ────────────────────────────────────────────────────────────

/**
 * Función base para peticiones privadas y públicas.
 * Maneja automáticamente la inyección del token de Fan si existe.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${CONFIG.API_URL}${path}`

  const headers = new Headers(options.headers ?? {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // ✅ UNIFICACIÓN: Siempre leemos el token de la bóveda (Vault) desde localStorage
  const fanToken = localStorage.getItem('MT_FAN_TOKEN')
  if (fanToken) {
    headers.set('Authorization', `Bearer ${fanToken}`)
  }

  const res = await fetch(url, { ...options, headers })

  const json = await res.json().catch(() => ({
    success: false,
    error: 'Invalid JSON response',
  }))

  if (!res.ok || json.success === false) {
    throw new Error(json.error ?? `Error ${res.status}`)
  }

  // Caso 1: Estructura estándar de Metritrak { success: true, data: T }
  if ('data' in json) {
    return json.data as T
  }

  // Caso 2: Respuesta plana (usada en algunos endpoints de checkout)
  const { success, error, ...rest } = json
  return rest as T
}

// ─── MARKETPLACE & EVENTS ────────────────────────────────────────────────────

/**
 * Obtiene la lista global de eventos para el Marketplace (Ticketplace).
 */
export async function getMarketplaceEvents(
  search: string = '',
  limit: number = 50,
  offset: number = 0
): Promise<EventSummary[]> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('limit', limit.toString())
  params.set('offset', offset.toString())

  return request<EventSummary[]>(`/tr/ticketplace/list?${params.toString()}`)
}

/**
 * Obtiene el detalle público de un evento por su slug.
 */
export async function getEventBySlug(slug: string): Promise<EventDetail> {
  return request<EventDetail>(`/tr/ticketplace/e/${slug}`)
}

/**
 * Obtiene los tipos de boletos (tiers) de un evento.
 */
export async function getEventTiers(eventId: string): Promise<Tier[]> {
  return request<Tier[]>(`/tr/events/${eventId}/tiers`)
}

// ─── ENGINE (Checkout y Reservas) ────────────────────────────────────────────

export async function createReservation(payload: ReserveRequest): Promise<ReserveResponse[]> {
  return request<ReserveResponse[]>('/tr/engine/reserve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getHandshake(email: string, project_id: string) {
  return request<ReserveResponse[]>('/tr/engine/handshake', {
    method: 'POST',
    body: JSON.stringify({ email, project_id }),
  })
}

export async function createCheckoutSession(
  payload: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  return request<CheckoutSessionResponse>('/tr/engine/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCheckoutStatus(sessionId: string): Promise<CheckoutSessionStatus> {
  return request<CheckoutSessionStatus>(`/tr/engine/handshacke/${sessionId}`)
}

// ─── VAULT (Acceso para Fans / Compradores) ──────────────────────────────────

/**
 * Solicita el código OTP al correo del Fan.
 */
export const requestVaultCode = async (email: string) => {
  return request<any>('/tr/vault/request-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/**
 * Realiza el login con el código OTP y guarda el token.
 */
export const vaultLogin = async (email: string, code: string) => {
  const data = await request<{ token: string; user: any }>('/tr/vault/login', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
  
  if (data.token) {
    localStorage.setItem('MT_FAN_TOKEN', data.token)
  }
  return data
}

/**
 * Obtiene las órdenes y boletos del Fan autenticado.
 */
export async function getMyTickets(): Promise<any> {
  return request<any>('/tr/vault/tickets')
}

/**
 * Genera la URL para añadir un boleto específico a Google Wallet.
 */
export async function getTicketGoogleWallet(ticketId: string): Promise<{ url: string }> {
  return request<{ url: string }>(`/tr/vault/ticket/${ticketId}/google-wallet`)
}


// En api.ts
export async function getPublicSettings(eventId: string): Promise<{ stripe_public_key: string; stripe_account?: string }> {
  return request<{ stripe_public_key: string; stripe_account?: string }>(`/tr/ticketplace/e/${eventId}/settings`)
}

// ─── REEMBOLSOS DE BOLETOS (solo boletos — no productos ni servicios) ───────
// Ticketrak no ejecuta el reembolso: el organizador lo confirma manualmente
// después de haberlo hecho por su cuenta con su proveedor de pago. Estas
// funciones solo abren la solicitud + el chat de seguimiento.

/** Estado (si existe) de la solicitud de reembolso de un boleto puntual. */
export async function getTicketRefundRequest(ticketId: string): Promise<TicketRefundRequest | null> {
  return request<TicketRefundRequest | null>(`/tr/refunds/ticket/${ticketId}`)
}

/** Abre (o reutiliza) el chat con el organizador sobre un boleto, sin pedir reembolso todavía. */
export async function startTicketVendorChat(
  ticketId: string,
): Promise<{ chat_uuid: string; vendor_email: string | null }> {
  return request(`/tr/refunds/chat`, {
    method: 'POST',
    body: JSON.stringify({ ticket_id: ticketId }),
  })
}

/** Registra la solicitud de reembolso de un boleto y abre el chat con el organizador. */
export async function requestTicketRefund(
  ticketId: string,
  reason: string,
): Promise<{ request: TicketRefundRequest; chat_uuid: string; vendor_email: string | null }> {
  return request(`/tr/refunds`, {
    method: 'POST',
    body: JSON.stringify({ ticket_id: ticketId, reason }),
  })
}

// ─── CHAT (genérico — acompaña la solicitud de reembolso) ──────────────────

export async function getChat(chatUuid: string): Promise<Aclaracion> {
  return request<Aclaracion>(`/chat/${chatUuid}`)
}

export async function sendChatMessage(chatUuid: string, message: string): Promise<void> {
  return request<void>(`/chat/${chatUuid}/message`, {
    method: 'POST',
    body: JSON.stringify({ sender: 'CUSTOMER', message }),
  })
}

