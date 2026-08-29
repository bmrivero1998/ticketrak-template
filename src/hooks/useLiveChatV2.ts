/**
 * Cliente del chat en vivo (v2, WebSocket + Durable Object). No sustituye
 * al chat normal (v1, REST + polling con VendorChatModal) — es un modo
 * aparte que el vendedor activa sobre la misma conversación (mismo uuid =
 * mismo roomId). Mientras nadie active v2, todo sigue igual que antes.
 *
 * El comprador nunca puede iniciar la sesión (ver ChatRoomV2DO en
 * metritrak-workers) — solo puede unirse a una que el vendedor ya haya
 * activado. Por eso este hook expone `pollLive` para revisar
 * periódicamente /v2/chat/:roomId/status mientras el chat está abierto, en
 * vez de intentar conectar el WebSocket a ciegas.
 *
 * Protocolo:
 *   cliente → servidor: {type:'message', message} | {type:'ping'} | {type:'end'}
 *   servidor → cliente: {type:'session'|'history'|'message'|'participants'|'ended', ...}
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from '@/config'

export type LiveSender = 'CUSTOMER' | 'VENDOR'

export interface LiveMessage {
  sender: LiveSender
  name: string
  message: string
  timestamp: string
}

type EndReason = 'timeout' | 'closed_by_vendor' | 'closed_by_customer' | 'closed_externally'

const ENDED_LABELS: Record<EndReason, string> = {
  timeout: 'La sesión en vivo terminó por inactividad (3 min).',
  closed_by_vendor: 'El vendedor finalizó el chat en vivo.',
  closed_by_customer: 'Finalizaste el chat en vivo.',
  closed_externally: 'La conversación se cerró.',
}

/** CONFIG.API_URL es algo como https://.../v1 — el módulo v2 vive fuera de /v1. */
function httpBaseUrl(): string {
  return CONFIG.API_URL.replace(/\/v1$/, '')
}

function wsUrl(roomId: string, sender: LiveSender, name: string): string {
  const base = httpBaseUrl().replace(/^http/, 'ws')
  return `${base}/v2/chat/${encodeURIComponent(roomId)}/ws?sender=${sender}&name=${encodeURIComponent(name)}`
}

export function useLiveChatV2() {
  const [isLive, setIsLive] = useState(false) // hay sesión activa en el servidor (según /status)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isActive, setIsActive] = useState(false) // nuestro WebSocket está conectado
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remainingLabel, setRemainingLabel] = useState('')
  const [endedReason, setEndedReason] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const teardown = useCallback(() => {
    setIsActive(false)
    setIsConnecting(false)
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch {
        // Ya estaba cerrado.
      }
      wsRef.current = null
    }
  }, [])

  useEffect(() => teardown, [teardown])

  const tickCountdown = useCallback((exp: number | null) => {
    if (!exp) return
    const msLeft = Math.max(0, exp - Date.now())
    const totalSec = Math.ceil(msLeft / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    setRemainingLabel(`${m}:${String(s).padStart(2, '0')}`)
  }, [])

  /** Consulta si hay una sesión en vivo activa, sin abrir WebSocket. */
  const pollLive = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`${httpBaseUrl()}/v2/chat/${encodeURIComponent(roomId)}/status`)
      if (!res.ok) {
        setIsLive(false)
        return false
      }
      const data = await res.json()
      setIsLive(!!data.live)
      return !!data.live
    } catch {
      return false
    }
  }, [])

  const connect = useCallback(
    (roomId: string, sender: LiveSender, name: string) => {
      teardown()
      setEndedReason(null)
      setMessages([])
      setIsConnecting(true)

      const ws = new WebSocket(wsUrl(roomId, sender, name))
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnecting(false)
        setIsActive(true)
      }

      ws.onmessage = (e) => {
        let parsed: any
        try {
          parsed = JSON.parse(e.data)
        } catch {
          return
        }

        if (parsed.type === 'session') {
          setExpiresAt(parsed.expiresAt)
          tickCountdown(parsed.expiresAt)
        } else if (parsed.type === 'history') {
          setMessages(parsed.data || [])
        } else if (parsed.type === 'message') {
          setMessages((prev) => [...prev, parsed.data])
        } else if (parsed.type === 'ended') {
          setEndedReason(ENDED_LABELS[parsed.reason as EndReason] || 'La sesión en vivo terminó.')
          setIsLive(false)
          teardown()
        }
      }

      ws.onclose = () => {
        setIsConnecting(false)
        setIsActive(false)
      }

      countdownRef.current = setInterval(() => {
        setExpiresAt((exp) => {
          tickCountdown(exp)
          return exp
        })
      }, 1000)
    },
    [teardown, tickCountdown],
  )

  const send = useCallback((message: string) => {
    const trimmed = message.trim()
    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'message', message: trimmed }))
  }, [])

  const ping = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }))
    }
  }, [])

  const end = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end' }))
    }
  }, [])

  return {
    isLive,
    isConnecting,
    isActive,
    messages,
    remainingLabel,
    endedReason,
    pollLive,
    connect,
    send,
    ping,
    end,
    disconnect: teardown,
  }
}
