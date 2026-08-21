import { useState } from 'react'
import { requestTicketRefund } from '@/services/api'
import { Spinner } from '../ui/Spinner'

interface Props {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  eventName: string
  onSubmitted: (chatUuid: string, vendorEmail: string | null) => void
}

export function RefundRequestModal({ isOpen, onClose, ticketId, eventName, onSubmitted }: Props) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Cuéntanos el motivo de tu solicitud.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { chat_uuid, vendor_email } = await requestTicketRefund(ticketId, reason.trim())
      onSubmitted(chat_uuid, vendor_email)
    } catch (err: any) {
      setError(err.message || 'No se pudo registrar la solicitud.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        .refund-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px); z-index: 10000;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .refund-sheet {
          width: 100%; max-width: 400px; background: #14161a; border-radius: 16px;
          padding: 22px; box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
        }
        .refund-sheet h3 { margin: 0 0 4px; color: #fff; font-size: 17px; font-weight: 700; }
        .refund-sheet p.sub { margin: 0 0 16px; color: rgba(255,255,255,0.55); font-size: 13px; }
        .refund-notice {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 12px; font-size: 12px; color: rgba(255,255,255,0.7);
          margin-bottom: 14px; line-height: 1.4;
        }
        .refund-textarea {
          width: 100%; min-height: 90px; background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.14); border-radius: 10px; padding: 10px 12px;
          color: #fff; font-size: 13.5px; resize: vertical; box-sizing: border-box;
        }
        .refund-textarea:focus { outline: none; border-color: rgba(255,255,255,0.4); }
        .refund-error { color: #ff8080; font-size: 12px; margin-top: 8px; }
        .refund-actions { display: flex; gap: 10px; margin-top: 16px; }
        .refund-cancel {
          flex: 1; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.8); border-radius: 10px; padding: 12px; cursor: pointer; font-weight: 600;
        }
        .refund-submit {
          flex: 1; background: #fff; color: #111; border: none; border-radius: 10px;
          padding: 12px; cursor: pointer; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .refund-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="refund-overlay" onClick={onClose}>
        <div className="refund-sheet" onClick={(e) => e.stopPropagation()}>
          <h3>Solicitar reembolso</h3>
          <p className="sub">{eventName}</p>

          <div className="refund-notice">
            Ticketrak no procesa el pago de reembolsos: al enviar tu solicitud se abre un chat
            directo con el organizador, quien es responsable de aprobarla y ejecutarla.
          </div>

          <textarea
            className="refund-textarea"
            placeholder="Cuéntanos por qué solicitas el reembolso..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && <div className="refund-error">{error}</div>}

          <div className="refund-actions">
            <button className="refund-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button className="refund-submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Spinner size={16} /> : 'Enviar solicitud'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
