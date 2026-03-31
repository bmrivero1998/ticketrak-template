import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatEventDate } from '@/config'

export function TicketView({ ticket, event, refProp, clean = false }: any) {
  return (
    <div
      ref={refProp}
      style={{
        background: '#000',
        borderRadius: 20,
        overflow: clean ? 'visible' : 'hidden',
        boxShadow: clean ? 'none' : '0 10px 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* HEADER */}
      <div style={{ position: 'relative', height: 160 }}>
        <img
          src={event.ticket_bg_image_url || event.poster_image_url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.8,
          }}
          crossOrigin="anonymous"
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, black, transparent)',
          }}
        />

        <div style={{ position: 'absolute', bottom: 10, left: 15 }}>
          <div style={{ fontSize: 12, color: '#ccc' }}>
            {formatEventDate(event.event_date)}
          </div>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>
            {event.event_name}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ background: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 10 }}>
          <strong>{ticket.tier_name}</strong>
        </div>

        <QRCodeSVG
          value={ticket.secret_token || ticket.ticket_id}
          size={160}
        />

        <div style={{ marginTop: 10, fontSize: 12 }}>
          {event.venue_name}
        </div>
      </div>
    </div>
  )
}