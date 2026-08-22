import { useEffect, useMemo, useState } from 'react'
import { getMyChats, type Aclaracion } from '@/services/api'
import { Spinner } from '../ui/Spinner'
import { VendorChatModal } from './VendorChatModal'

const targetTypeLabels: Record<string, string> = {
  TICKET_INQUIRY: 'Duda de boleto',
  TICKET_REFUND: 'Reembolso de boleto',
  ORDER_INQUIRY: 'Duda de producto',
  ORDER_REFUND: 'Reembolso de producto',
}

function targetTypeLabel(targetType: string) {
  const prefix = targetType.split(':')[0] ?? targetType
  return targetTypeLabels[prefix] || prefix
}

export function VaultChatsPanel() {
  const [chats, setChats] = useState<Aclaracion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'OPEN' | 'ALL'>('OPEN')
  const [activeChatUuid, setActiveChatUuid] = useState<string | null>(null)

  const loadChats = async () => {
    setLoading(true)
    setError(null)
    try {
      setChats(await getMyChats())
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar tus chats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChats()
  }, [])

  const filteredChats = useMemo(() => {
    const list = filter === 'OPEN' ? chats.filter((c) => c.status === 'OPEN') : chats
    return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [chats, filter])

  if (loading) {
    return (
      <div className="vault-loading">
        <Spinner size={44} />
        <p>Cargando tus chats…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="vault-empty-state">
        <div className="vault-empty-icon">⚠️</div>
        <h4>Algo salió mal</h4>
        <p className="text-muted">{error}</p>
        <button onClick={loadChats} className="btn btn-primary rounded-pill px-4 mt-2">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .chats-filter-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .chat-list-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: 'Barlow', sans-serif;
        }
        .chat-list-item:hover {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.08);
        }
        .chat-list-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .chat-list-type { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85); }
        .chat-list-status {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
          padding: 2px 8px; border-radius: 100px;
        }
        .chat-list-status.open { background: rgba(34,197,94,0.15); color: #4ade80; }
        .chat-list-status.other { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); }
        .chat-list-message {
          font-size: 13px; color: rgba(255,255,255,0.55); margin: 6px 0 4px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .chat-list-date { font-size: 11px; color: rgba(255,255,255,0.35); }
      `}</style>

      <div className="chats-filter-row">
        <button
          onClick={() => setFilter('OPEN')}
          className={`filter-pill btn ${filter === 'OPEN' ? 'active' : ''}`}
        >
          Abiertos
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`filter-pill btn ${filter === 'ALL' ? 'active' : ''}`}
        >
          Todos
        </button>
      </div>

      {filteredChats.length === 0 ? (
        <div className="vault-no-results">
          <div className="vault-no-results-icon">💬</div>
          <h5>{filter === 'OPEN' ? 'No tienes chats abiertos' : 'Aún no tienes chats'}</h5>
          <p style={{ fontSize: 13, margin: 0 }}>
            Los chats que abras con un organizador o vendedor aparecerán aquí.
          </p>
        </div>
      ) : (
        filteredChats.map((chat) => {
          const lastMessage = chat.history_chat[chat.history_chat.length - 1]
          return (
            <div key={chat.uuid} className="chat-list-item" onClick={() => setActiveChatUuid(chat.uuid)}>
              <div className="chat-list-top">
                <span className="chat-list-type">{targetTypeLabel(chat.target_type)}</span>
                <span className={`chat-list-status ${chat.status === 'OPEN' ? 'open' : 'other'}`}>
                  {chat.status === 'OPEN' ? 'Abierto' : chat.status === 'RESOLVED' ? 'Resuelto' : 'Cerrado'}
                </span>
              </div>
              <p className="chat-list-message">{lastMessage?.message || 'Sin mensajes'}</p>
              <span className="chat-list-date">
                {new Date(chat.updated_at).toLocaleString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )
        })
      )}

      {activeChatUuid && (
        <VendorChatModal
          isOpen={!!activeChatUuid}
          onClose={() => {
            setActiveChatUuid(null)
            loadChats()
          }}
          chatUuid={activeChatUuid}
        />
      )}
    </>
  )
}
