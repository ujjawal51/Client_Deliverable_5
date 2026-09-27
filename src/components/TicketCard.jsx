import React, { useState } from 'react';
import { Download, Copy, Check, Printer } from 'lucide-react';
import { logTelemetry } from '../utils/telemetry';

export default function TicketCard({ ticket }) {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(ticket.qrPayload);
      setCopied(true);
      logTelemetry('COPY_QR_PAYLOAD', { ticketCode: ticket.ticketCode });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    logTelemetry('DOWNLOAD_QR_IMAGE', { ticketCode: ticket.ticketCode });
    const link = document.createElement('a');
    link.href = ticket.qrDataUrl;
    link.download = `${ticket.ticketCode}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    logTelemetry('PRINT_TICKET', { ticketCode: ticket.ticketCode });
    window.print();
  };

  return (
    <article className="corporate-card" aria-label={`Generated Ticket for ${ticket.holderName}`}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Ticket Generated Successfully</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Status: <strong>{ticket.status}</strong>
          </span>
        </div>
        <span className="badge">{ticket.tierId}</span>
      </div>

      <div className="ticket-preview">
        <div className="qr-image-wrapper">
          <img
            src={ticket.qrDataUrl}
            alt={`Generated QR Code for Ticket ${ticket.ticketCode}`}
            className="qr-image"
          />
        </div>

        <div className="ticket-meta">
          <div className="meta-row">
            <span className="meta-label">Ticket Code:</span>
            <span className="meta-value">{ticket.ticketCode}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Attendee Name:</span>
            <span className="meta-value">{ticket.holderName}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Email:</span>
            <span className="meta-value">{ticket.holderEmail}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Seat:</span>
            <span className="meta-value">{ticket.seatNumber || 'General Admission'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Security Hash:</span>
            <span className="meta-value" style={{ fontSize: '10px' }} title={ticket.securityHash}>
              {ticket.securityHash ? ticket.securityHash.substring(0, 16) + '...' : 'N/A'}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Issued At:</span>
            <span className="meta-value" style={{ fontSize: '11px' }}>
              {new Date(ticket.issuedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownload}
            aria-label="Download QR Code Image"
            style={{ flex: 1 }}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyPayload}
            aria-label="Copy Raw QR Payload"
            style={{ flex: 1 }}
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            <span>{copied ? 'Copied' : 'Payload'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            aria-label="Print Ticket"
            style={{ flex: 1 }}
          >
            <Printer size={14} aria-hidden="true" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </article>
  );
}
