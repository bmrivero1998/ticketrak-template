import { useEffect, useRef, useState } from 'react'
import { getChat, sendChatMessage, type Aclaracion, type ChatMessage } from '@/services/api'
import { Spinner } from '../ui/Spinner'
import { useLiveChatV2 } from '@/hooks/useLiveChatV2'

const LIVE_POLL_MS = 20000

interface Props {
  isOpen: boolean
  onClose: () => void
  chatUuid: string
  vendorEmail?: string | null
}

export function VendorChatModal({ isOpen, onClose, chatUuid, vendorEmail }: Props) {
  const [chat, setChat] = useState<Aclaracion | null>(null)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveDraft, setLiveDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const liveBottomRef = useRef<HTMLDivElement>(null)
  const live = useLiveChatV2()

  useEffect(() => {
    if (!isOpen || !chatUuid) return

    let cancelled = false

    const load = async () => {
      try {
        const data = await getChat(chatUuid)
        if (!cancelled) setChat(data)
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'No se pudo cargar el chat.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 8000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isOpen, chatUuid])

  // El comprador nunca inicia la sesión en vivo — solo detecta si el
  // vendedor ya la activó (chequeo liviano, sin abrir WebSocket).
  useEffect(() => {
    if (!isOpen || !chatUuid || live.isActive) return

    let cancelled = false
    const check = () => {
      if (!cancelled) live.pollLive(chatUuid)
    }

    check()
    const interval = setInterval(check, LIVE_POLL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chatUuid, live.isActive])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.history_chat.length])

  useEffect(() => {
    liveBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [live.messages.length])

  useEffect(() => {
    // Cuando termina la sesión en vivo (fin explícito, timeout, o cierre
    // desde el panel del vendedor), recargamos el chat normal — ya trae
    // los mensajes que se hablaron en vivo, el backend los vuelca a v1
    // antes de cerrar.
    if (!live.isActive && live.endedReason) {
      getChat(chatUuid).then(setChat).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.isActive, live.endedReason])

  if (!isOpen) return null

  const joinLiveChat = () => {
    live.connect(chatUuid, 'CUSTOMER', chat?.customer_email || 'Comprador')
  }

  const handleLiveSend = () => {
    if (!liveDraft.trim()) return
    live.send(liveDraft)
    setLiveDraft('')
  }

  const handleSend = async () => {
    const message = draft.trim()
    if (!message || isSending) return

    setIsSending(true)
    setError(null)

    const optimistic: ChatMessage = {
      sender: 'CUSTOMER',
      message,
      timestamp: new Date().toISOString(),
    }

    setChat((prev) => (prev ? { ...prev, history_chat: [...prev.history_chat, optimistic] } : prev))
    setDraft('')

    try {
      await sendChatMessage(chatUuid, message)
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el mensaje.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <style>{`
        .chat-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px); z-index: 10000;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .chat-sheet {
          width: 100%; max-width: 420px; height: min(600px, 85vh);
          background: #14161a; border-radius: 16px; overflow: hidden;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
        }
        .chat-header {
          padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: space-between;
        }
        .chat-header h3 { margin: 0; font-size: 15px; color: #fff; font-weight: 700; }
        .chat-header p { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.55); }
        .chat-close {
          background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.7);
          width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px;
        }
        .chat-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .chat-bubble { max-width: 80%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.4; }
        .chat-bubble.customer { align-self: flex-end; background: #fff; color: #111; border-bottom-right-radius: 4px; }
        .chat-bubble.vendor { align-self: flex-start; background: rgba(255,255,255,0.1); color: #fff; border-bottom-left-radius: 4px; }
        .chat-bubble.system {
          align-self: center; background: transparent; color: rgba(255,255,255,0.5);
          font-size: 12px; text-align: center; max-width: 95%;
        }
        .chat-footer { padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 8px; }
        .chat-input {
          flex: 1; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.14);
          border-radius: 10px; padding: 10px 12px; color: #fff; font-size: 13.5px; resize: none;
        }
        .chat-input:focus { outline: none; border-color: rgba(255,255,255,0.4); }
        .chat-send {
          background: #fff; color: #111; border: none; border-radius: 10px;
          padding: 0 16px; font-weight: 700; cursor: pointer; font-size: 13px;
        }
        .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-error { color: #ff8080; font-size: 12px; padding: 0 16px 8px; }
        .chat-live-banner {
          margin: 12px 16px 0; padding: 10px 12px; border-radius: 10px;
          background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35);
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .chat-live-banner span { color: #4ade80; font-size: 12.5px; font-weight: 600; }
        .chat-live-join {
          background: #4ade80; color: #06210f; border: none; border-radius: 8px;
          padding: 6px 12px; font-weight: 700; cursor: pointer; font-size: 12px;
        }
        .chat-live-bar {
          padding: 10px 16px; background: rgba(239, 68, 68, 0.12);
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: #f87171; font-weight: 700;
        }
        .chat-bubble.mine { align-self: flex-end; background: #fff; color: #111; border-bottom-right-radius: 4px; }
        .chat-bubble.theirs { align-self: flex-start; background: rgba(255,255,255,0.1); color: #fff; border-bottom-left-radius: 4px; }
        .chat-live-end {
          background: transparent; color: #f87171; border: 1px solid rgba(248,113,113,0.4);
          border-radius: 8px; padding: 8px; font-size: 12px; cursor: pointer; margin: 0 14px 12px;
        }
        .chat-ended-banner {
          margin: 12px 16px 0; padding: 10px 12px; border-radius: 10px; text-align: center;
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); font-size: 12px;
        }
      `}</style>

      <div className="chat-overlay" onClick={onClose}>
        <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <div>
              <h3>Chat con el organizador</h3>
              {vendorEmail && <p>{vendorEmail}</p>}
            </div>
            <button className="chat-close" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>

          {live.isActive ? (
            <>
              <div className="chat-live-bar">
                <span>🔴 En vivo</span>
                <span>{live.remainingLabel}</span>
              </div>

              <div className="chat-body">
                {live.messages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.sender === 'CUSTOMER' ? 'mine' : 'theirs'}`}>
                    {m.message}
                  </div>
                ))}
                <div ref={liveBottomRef} />
              </div>

              <div className="chat-footer">
                <textarea
                  className="chat-input"
                  rows={1}
                  placeholder="Mensaje en vivo..."
                  value={liveDraft}
                  onChange={(e) => setLiveDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleLiveSend()
                    }
                  }}
                />
                <button className="chat-send" onClick={handleLiveSend} disabled={!liveDraft.trim()}>
                  Enviar
                </button>
              </div>
              <button className="chat-live-end" onClick={live.end}>
                Finalizar chat en vivo
              </button>
            </>
          ) : (
            <>
              {live.isLive && (
                <div className="chat-live-banner">
                  <span>🟢 El vendedor está en línea — chat en vivo disponible</span>
                  <button className="chat-live-join" onClick={joinLiveChat}>
                    Entrar
                  </button>
                </div>
              )}
              {live.endedReason && <div className="chat-ended-banner">{live.endedReason}</div>}

              <div className="chat-body">
                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                    <Spinner size={20} />
                  </div>
                )}
                {!isLoading && chat?.history_chat.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.sender.toLowerCase()}`}>
                    {m.message}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {error && <div className="chat-error">{error}</div>}

              <div className="chat-footer">
                <textarea
                  className="chat-input"
                  rows={1}
                  placeholder="Escribe un mensaje..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <button className="chat-send" onClick={handleSend} disabled={isSending || !draft.trim()}>
                  {isSending ? <Spinner size={14} /> : 'Enviar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
