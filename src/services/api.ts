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

/**
 * Al volver de PayPal (redirect de aprobación) hay que capturar la orden
 * explícitamente para que se libere el cobro y se emitan los boletos.
 */
export async function capturePayPalOrder(
  ppOrderId: string,
  projectUuid: string,
): Promise<{ orderUuid?: string; module?: 'ticketrak' | 'booking' }> {
  return request<{ orderUuid?: string; module?: 'ticketrak' | 'booking' }>(
    '/v2/payments/paypal/capture',
    {
      method: 'POST',
      body: JSON.stringify({ ppOrderId, project_uuid: projectUuid }),
    },
  )
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

// ─── CHAT CON EL VENDEDOR Y REEMBOLSOS ───────────────────────────────────────
// Ticketrak solo cobra boletos vía Stripe, por eso estos flujos no distinguen
// proveedor de pago. La plataforma no ejecuta reembolsos directamente: solo
// registra la solicitud y abre un chat con el vendedor para resolverlo.

export interface ChatMessage {
  sender: 'CUSTOMER' | 'VENDOR' | 'SYSTEM'
  message: string
  timestamp: string
}

export interface Aclaracion {
  uuid: string
  project_uuid: string
  customer_uuid?: string | null
  target_type: string
  customer_email: string
  status: 'OPEN' | 'RESOLVED' | 'CLOSED'
  history_chat: ChatMessage[]
  created_at: string
  updated_at: string
}

export type RefundRequestStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED'

export interface RefundRequest {
  id: string
  ticket_id: string
  project_id: string
  customer_id: string
  customer_email: string
  reason: string
  amount_requested_cents: number
  status: RefundRequestStatus
  chat_uuid?: string | null
  resolution_note?: string | null
  created_at: string
  updated_at: string
}

/**
 * Abre (o reutiliza) el chat del fan con el vendedor de un boleto.
 */
export async function startVendorChat(
  ticketId: string,
): Promise<{ chat_uuid: string; vendor_email: string | null }> {
  return request<{ chat_uuid: string; vendor_email: string | null }>('/tr/refunds/chat', {
    method: 'POST',
    body: JSON.stringify({ ticket_id: ticketId }),
  })
}

/**
 * Registra una solicitud de reembolso para un boleto y abre su chat.
 */
export async function requestTicketRefund(
  ticketId: string,
  reason: string,
): Promise<{ request: RefundRequest; chat_uuid: string; vendor_email: string | null }> {
  return request<{ request: RefundRequest; chat_uuid: string; vendor_email: string | null }>('/tr/refunds', {
    method: 'POST',
    body: JSON.stringify({ ticket_id: ticketId, reason }),
  })
}

/**
 * Estado de la solicitud de reembolso (si existe) de un boleto puntual.
 */
export async function getTicketRefundRequest(ticketId: string): Promise<RefundRequest | null> {
  return request<RefundRequest | null>(`/tr/refunds/ticket/${ticketId}`)
}

/**
 * Todas las solicitudes de reembolso del fan autenticado.
 */
export async function getMyRefundRequests(): Promise<RefundRequest[]> {
  return request<RefundRequest[]>('/tr/refunds/mine')
}

/**
 * TODAS las conversaciones del fan autenticado (boletos y productos, sin
 * importar el organizador) — para la pantalla "Mis chats" del Vault.
 */
export async function getMyChats(): Promise<Aclaracion[]> {
  return request<Aclaracion[]>('/chat/mine')
}

/**
 * Detalle de una conversación (chat) por su UUID.
 */
export async function getChat(chatUuid: string): Promise<Aclaracion> {
  return request<Aclaracion>(`/chat/${chatUuid}`)
}

/**
 * Envía un mensaje del comprador dentro de un chat abierto.
 */
export async function sendChatMessage(chatUuid: string, message: string): Promise<void> {
  await request<void>(`/chat/${chatUuid}/message`, {
    method: 'POST',
    body: JSON.stringify({ sender: 'CUSTOMER', message }),
  })
}

