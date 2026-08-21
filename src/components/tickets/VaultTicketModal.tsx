import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { getTicketGoogleWallet, startVendorChat } from '@/services/api'
import { Spinner } from '../ui/Spinner'
import { EventDataVault, TicketVault } from '@/types'
import { TicketView } from './TicketView'
import { VendorChatModal } from './VendorChatModal'
import { RefundRequestModal } from './RefundRequestModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  ticket: TicketVault
  event: EventDataVault
}

export function VaultTicketModal({ isOpen, onClose, ticket, event }: Props) {
  const exportRef = useRef<HTMLDivElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [isOpeningChat, setIsOpeningChat] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<{ uuid: string; vendorEmail: string | null } | null>(null)

  if (!isOpen || !ticket || !event) return null

  const canRequestRefund = ticket.status === 'ACTIVE'

  const handleOpenVendorChat = async () => {
    try {
      setIsOpeningChat(true)
      const { chat_uuid, vendor_email } = await startVendorChat(ticket.ticket_id)
      setActiveChat({ uuid: chat_uuid, vendorEmail: vendor_email })
    } catch (err: any) {
      alert(err.message || 'No se pudo abrir el chat con el organizador.')
    } finally {
      setIsOpeningChat(false)
    }
  }

  // 🧠 CAPTURA LIMPIA (SIN GLITCH)
  const generateImage = async () => {
    if (!exportRef.current) return null

    setIsProcessing(true)

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#000',
        useCORS: true,
      })

      return canvas
    } catch (error) {
      console.error(error)
      alert('Error generando imagen')
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    const canvas = await generateImage()
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `Ticket_${event.event_name}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  const handleShare = async () => {
    const canvas = await generateImage()
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], 'ticket.jpg', { type: 'image/jpeg' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        handleDownload()
      }
    })
  }

  const handleGoogleWallet = async () => {
    try {
      setIsAddingWallet(true)
      const res = await getTicketGoogleWallet(ticket.ticket_id)
      if (res.url) window.open(res.url, '_blank')
    } catch {
      alert('No disponible')
    } finally {
      setIsAddingWallet(false)
    }
  }

  return (
    <>
      {/* Estilos inyectados */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap');

        .vault-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: overlayIn 0.25s ease;
        }

        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .vault-sheet {
          width: 100%;
          max-width: 400px;
          animation: sheetUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes sheetUp {
          from { transform: translateY(40px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }

        /* — Boleto — */
        .ticket-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
          position: relative;
        }

        /* Perforación lateral izquierda/derecha */
        .ticket-perforation {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          background: rgba(0,0,0,0.92);
          border-radius: 50%;
          z-index: 10;
        }
        .ticket-perforation.left  { left: -9px; }
        .ticket-perforation.right { right: -9px; }

        /* Línea de corte punteada */
        .ticket-divider {
          position: relative;
          height: 1px;
          margin: 0 18px;
          border-top: 2px dashed #d1d5db;
        }
        .ticket-divider::before,
        .ticket-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          background: rgba(0,0,0,0.92);
          border-radius: 50%;
        }
        .ticket-divider::before { left: -27px; }
        .ticket-divider::after  { right: -27px; }

        /* Sección principal del boleto */
        .ticket-main {
          padding: 24px 24px 20px;
          background: #fff;
        }

        /* Sección del stub (talón) */
        .ticket-stub {
          padding: 16px 24px;
          background: #f9fafb;
        }

        /* Acciones */
        .vault-actions {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-wallet {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          border-radius: 10px;
          padding: 13px 20px;
          background: #fff;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .btn-wallet:hover  { background: #f0f0f0; }
        .btn-wallet:active { transform: scale(0.98); }
        .btn-wallet:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 10px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 1;
        }
        .btn-ghost:hover  { border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.1); }
        .btn-ghost:active { transform: scale(0.97); }

        .btn-close-modal {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.7);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
          z-index: 10000;
        }
        .btn-close-modal:hover { background: rgba(255,255,255,0.18); color: #fff; }
      `}</style>

      {/* 🫥 TICKET OCULTO (PARA EXPORTAR) */}
      <div style={{ position: 'fixed', top: '-9999px', left: 0 }}>
        <TicketView refProp={exportRef} ticket={ticket} event={event} clean />
      </div>

      {/* 👁️ MODAL */}
      <div className="vault-overlay">
        {/* Botón cerrar */}
        <button className="btn-close-modal" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="vault-sheet">
          {/* 🎟️ TICKET VISUAL — estructura de boleto físico */}
          <div className="ticket-wrap">
            {/* Perforaciones laterales en el divisor */}
            <div className="ticket-perforation left" />
            <div className="ticket-perforation right" />

            {/* Sección principal */}
            <div className="ticket-main">
              <TicketView ticket={ticket} event={event} />
            </div>

            {/* Divisor estilo corte */}
            <div className="ticket-divider" />

            {/* Stub / talón */}
            <div className="ticket-stub">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#9ca3af',
                    marginBottom: 2,
                  }}>
                    Talón de ingreso
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    letterSpacing: '0.04em',
                  }}>
                    {ticket.ticket_id}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  textAlign: 'right',
                }}>
                  Presentar en<br />
                  <span style={{ color: '#374151', fontSize: 12 }}>acceso principal</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🔘 ACCIONES */}
          <div className="vault-actions">
            {/* Google Wallet — full width */}
            <button
              className="btn-wallet"
              onClick={handleGoogleWallet}
              disabled={isAddingWallet}
            >
              {isAddingWallet ? (
                <Spinner size={18} />
              ) : (
                <>
                  {/* Google "G" icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Agregar a Google Wallet
                </>
              )}
            </button>

            {/* Descargar + Compartir — fila */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={handleDownload} disabled={isProcessing}>
                {isProcessing ? <Spinner size={16} /> : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descargar
                  </>
                )}
              </button>
              <button className="btn-ghost" onClick={handleShare}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Compartir
              </button>
            </div>

            {/* Chat con el vendedor + solicitud de reembolso */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={handleOpenVendorChat} disabled={isOpeningChat}>
                {isOpeningChat ? <Spinner size={16} /> : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    Chat con el organizador
                  </>
                )}
              </button>
              {canRequestRefund && (
                <button className="btn-ghost" onClick={() => setIsRefundModalOpen(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  Solicitar reembolso
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <RefundRequestModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        ticketId={ticket.ticket_id}
        eventName={event.event_name}
        onSubmitted={(chatUuid, vendorEmail) => {
          setIsRefundModalOpen(false)
          setActiveChat({ uuid: chatUuid, vendorEmail })
        }}
      />

      {activeChat && (
        <VendorChatModal
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          chatUuid={activeChat.uuid}
          vendorEmail={activeChat.vendorEmail}
        />
      )}
    </>
  )
}