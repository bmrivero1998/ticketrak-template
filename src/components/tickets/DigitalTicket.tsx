import { QRCodeSVG } from 'qrcode.react';

export function DigitalTicket({ ticket, eventName }: { ticket: any, eventName: string }) {
  return (
    <div className="bg-white p-4 rounded-4 text-center text-dark mx-auto" style={{ maxWidth: '320px' }}>
      <p className="small fw-bold text-uppercase mb-1">{eventName}</p>
      <h3 className="h6 mb-3">{ticket.tier_name}</h3>
      
      <div className="bg-light p-3 rounded-3 mb-3 d-inline-block">
        <QRCodeSVG value={ticket.qr_code} size={200} />
      </div>
      
      <p className="fw-mono small mb-0 opacity-50">{ticket.qr_code}</p>
      <hr />
      <p className="small mb-0 text-muted">Presenta este código en el acceso</p>
    </div>
  )
}