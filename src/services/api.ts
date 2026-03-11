/**
 * Cliente HTTP de Ticketrak Public API
 * Unwrap automático de ResponseApi<T> → devuelve solo data
 */

import { CONFIG } from '../config'
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
} from '../types'

// ─── CORE REQUEST ────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${CONFIG.API_URL}${path}`

  const headers = new Headers(options.headers ?? {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const fanToken = sessionStorage.getItem('fan_token')
  if (fanToken) headers.set('Authorization', `Bearer ${fanToken}`)

  const res = await fetch(url, { ...options, headers })

  const json = await res.json().catch(() => ({
    success: false,
    error: 'Invalid JSON response',
  }))

  if (!res.ok || json.success === false) {
    throw new Error(json.error ?? `Error ${res.status}`)
  }

  // ✅ CASO 1: ResponseApi<T>
  if ('data' in json) {
    return json.data as T
  }

  // ✅ CASO 2: Response plano (checkout)
  const { success, error, ...rest } = json
  return rest as T
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventSummary[]> {
  const params = new URLSearchParams()
  if (CONFIG.PROJECT_ID) params.set('project_id', CONFIG.PROJECT_ID)
  if (!CONFIG.SHOW_PAST_EVENTS) params.set('status', 'PUBLISHED')

  return request<EventSummary[]>(`/tr/events/public?${params.toString()}`)
}

export async function getEvent(id: string): Promise<EventDetail> {
  return request<EventDetail>(`/tr/events/${id}`)
}

export async function getEventTiers(eventId: string): Promise<Tier[]> {
  return request<Tier[]>(`/tr/events/${eventId}/tiers`)
}

// ─── ENGINE ──────────────────────────────────────────────────────────────────

export async function createReservation(payload: ReserveRequest): Promise<ReserveResponse[]> {
  return request<ReserveResponse[]>('/tr/engine/reserve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getHandshake(email:string, project_id:string) {
  const payload ={
    project_id,
    email
  } 
   return request<ReserveResponse[]>('/tr/engine/handshake', {
    method: 'POST',
    body: JSON.stringify(payload),
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
  return request<CheckoutSessionStatus>(`/tr/engine/handshake/${sessionId}`)
}

// ─── VAULT ───────────────────────────────────────────────────────────────────

export async function requestVaultCode(email: string): Promise<void> {
  await request<void>('/tr/vault/request-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

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

export async function getMyTickets(): Promise<{ event: EventSummary; tickets: Ticket[] }> {
  return request<{ event: EventSummary; tickets: Ticket[] }>('/tr/vault/tickets')
}
