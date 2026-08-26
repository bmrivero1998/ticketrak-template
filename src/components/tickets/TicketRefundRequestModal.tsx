import { useState } from 'react'
import { BiErrorCircle } from 'react-icons/bi'
import { Spinner } from '../ui/Spinner'
import { requestTicketRefund } from '@/services/api'

interface Props {
  isOpen: boolean
  ticketId: string
  tierName: string
  onClose: () => void
  onSubmitted: (payload: { chatUuid: string; vendorEmail: string | null }) => void
}

/**
 * Solicitud de reembolso de UN boleto. Ticketrak no ejecuta el reembolso:
 * al enviar esto se abre un chat directo con el organizador, quien es
 * responsable de aprobarlo y ejecutarlo con su propio proveedor de pago.
 */
export function TicketRefundRequestModal({ isOpen, ticketId, tierName, onClose, onSubmitted }: Props) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Cuéntanos el motivo de tu solicitud.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const result = await requestTicketRefund(ticketId, reason.trim())
      onSubmitted({ chatUuid: result.chat_uuid, vendorEmail: result.vendor_email })
    } catch (err: any) {
      setError(err.message || 'No se pudo registrar la solicitud.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="refund-modal-overlay" onClick={onClose}>
      <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
        <div className="refund-modal-header">
          <h3>Solicitar reembolso</h3>
          <button className="refund-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <p className="refund-modal-ticket">{tierName}</p>

        <div className="refund-modal-notice">
          Ticketrak no procesa el pago de tu reembolso: al enviar esta solicitud se abre un chat
          directo con el organizador, quien es responsable de aprobarla y ejecutarla.
        </div>

        <form onSubmit={handleSubmit}>
          <label className="refund-modal-label">Motivo</label>
          <textarea
            className="refund-modal-textarea"
            rows={4}
            placeholder="Cuéntanos qué pasó..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && (
            <div className="refund-modal-error">
              <BiErrorCircle size={16} />
              {error}
            </div>
          )}

          <div className="refund-modal-actions">
            <button type="button" className="refund-btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="refund-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size={16} /> : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .refund-modal-overlay {
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

        .refund-modal {
          width: 100%;
          max-width: 420px;
          background: #171717;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 24px;
        }

        .refund-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .refund-modal-header h3 {
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0;
        }

        .refund-modal-close {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
        }
        .refund-modal-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

        .refund-modal-ticket {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin: 4px 0 14px;
        }

        .refund-modal-notice {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65);
          font-size: 0.78rem;
          line-height: 1.5;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 18px;
        }

        .refund-modal-label {
          display: block;
          color: rgba(255,255,255,0.5);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .refund-modal-textarea {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #374151;
          border-radius: 12px;
          color: #fff;
          padding: 10px 12px;
          font-size: 0.9rem;
          resize: vertical;
        }
        .refund-modal-textarea:focus {
          outline: none;
          border-color: #f97316;
        }

        .refund-modal-error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refund-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .refund-btn-cancel {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid #374151;
          border-radius: 40px;
          color: #9ca3af;
          font-weight: 600;
          cursor: pointer;
        }
        .refund-btn-cancel:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        .refund-btn-submit {
          flex: 1;
          padding: 12px;
          background: #f97316;
          border: none;
          border-radius: 40px;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .refund-btn-submit:hover { background: #ea580c; }
        .refund-btn-submit:disabled, .refund-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
