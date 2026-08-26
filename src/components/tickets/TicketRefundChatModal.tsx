import { useEffect, useRef, useState } from 'react'
import { Spinner } from '../ui/Spinner'
import { getChat, sendChatMessage } from '@/services/api'
import type { Aclaracion } from '@/types'

interface Props {
  isOpen: boolean
  chatUuid: string
  vendorEmail?: string | null
  onClose: () => void
}

/** Chat de seguimiento de una solicitud de reembolso de boleto con el organizador. */
export function TicketRefundChatModal({ isOpen, chatUuid, vendorEmail, onClose }: Props) {
  const [chat, setChat] = useState<Aclaracion | null>(null)
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  async function load() {
    try {
      const data = await getChat(chatUuid)
      setChat(data)
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el chat.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chatUuid])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [chat?.history_chat.length])

  if (!isOpen) return null

  async function send() {
    const message = draft.trim()
    if (!message || isSending) return

    setIsSending(true)
    setError('')
    setDraft('')
    setChat((prev) =>
      prev
        ? { ...prev, history_chat: [...prev.history_chat, { sender: 'CUSTOMER', message, timestamp: new Date().toISOString() }] }
        : prev,
    )

    try {
      await sendChatMessage(chatUuid, message)
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el mensaje.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="tr-chat-overlay" onClick={onClose}>
      <div className="tr-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tr-chat-header">
          <div>
            <h3>Chat con el organizador</h3>
            {vendorEmail && <p>{vendorEmail}</p>}
          </div>
          <button className="tr-chat-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div ref={bodyRef} className="tr-chat-body">
          {isLoading ? (
            <div className="tr-chat-loading"><Spinner size={24} /></div>
          ) : (
            chat?.history_chat.map((m, i) => (
              <div
                key={i}
                className={`tr-chat-bubble ${
                  m.sender === 'CUSTOMER' ? 'tr-chat-bubble--mine' : m.sender === 'VENDOR' ? 'tr-chat-bubble--vendor' : 'tr-chat-bubble--system'
                }`}
              >
                {m.message}
              </div>
            ))
          )}
        </div>

        {error && <p className="tr-chat-error">{error}</p>}

        <div className="tr-chat-footer">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={isSending || !draft.trim()} aria-label="Enviar">
            {isSending ? <Spinner size={16} /> : '➤'}
          </button>
        </div>
      </div>

      <style>{`
        .tr-chat-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 10001;
        }

        .tr-chat-modal {
          width: 100%;
          max-width: 420px;
          height: min(32rem, 85dvh);
          background: #171717;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .tr-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .tr-chat-header h3 {
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
        }
        .tr-chat-header p {
          color: rgba(255,255,255,0.45);
          font-size: 0.78rem;
          margin: 2px 0 0;
        }

        .tr-chat-close {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          flex-shrink: 0;
        }
        .tr-chat-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

        .tr-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tr-chat-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .tr-chat-bubble {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          line-height: 1.4;
        }
        .tr-chat-bubble--mine {
          align-self: flex-end;
          background: #f97316;
          color: #fff;
        }
        .tr-chat-bubble--vendor {
          align-self: flex-start;
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tr-chat-bubble--system {
          align-self: center;
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-size: 0.75rem;
          text-align: center;
        }

        .tr-chat-error {
          color: #ef4444;
          font-size: 0.78rem;
          padding: 0 16px;
          margin: 0 0 8px;
        }

        .tr-chat-footer {
          display: flex;
          gap: 8px;
          padding: 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .tr-chat-footer input {
          flex: 1;
          background: #0a0a0a;
          border: 1px solid #374151;
          border-radius: 40px;
          color: #fff;
          padding: 10px 16px;
          font-size: 0.85rem;
        }
        .tr-chat-footer input:focus { outline: none; border-color: #f97316; }
        .tr-chat-footer button {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          border: none;
          background: #f97316;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .tr-chat-footer button:hover { background: #ea580c; }
        .tr-chat-footer button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
