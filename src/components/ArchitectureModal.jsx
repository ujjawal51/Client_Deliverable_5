import React, { useState } from 'react';
import { X, FileText, Database, ShieldCheck } from 'lucide-react';
import { logTelemetry } from '../utils/telemetry';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('schema');

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="arch-modal-title"
    >
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 id="arch-modal-title" style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase' }}>
              Architectural Planning & Contracts (Capstone 1)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Ticket DEL-10254 Architectural Specification & Definitive Schema
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              logTelemetry('CLOSE_ARCHITECTURE_MODAL');
              onClose();
            }}
            aria-label="Close Architecture Modal"
            style={{ padding: '8px 12px' }}
          >
            <X size={16} aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>

        <div className="modal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('schema');
              logTelemetry('SWITCH_ARCH_TAB', { tab: 'schema' });
            }}
          >
            <Database size={14} style={{ display: 'inline', marginRight: '6px' }} aria-hidden="true" />
            Database Schema (ERD & DDL)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('contracts');
              logTelemetry('SWITCH_ARCH_TAB', { tab: 'contracts' });
            }}
          >
            <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} aria-hidden="true" />
            API Contracts & Schemas
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'nfr' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('nfr');
              logTelemetry('SWITCH_ARCH_TAB', { tab: 'nfr' });
            }}
          >
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} aria-hidden="true" />
            NFR & Vibe Workflow Audit
          </button>
        </div>

        {activeTab === 'schema' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
              Relational Tables: tickets, qr_codes, worker_jobs, events, telemetry_logs
            </h3>
            <pre className="pre-box">{`-- Core Tickets Schema (PostgreSQL 16)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    tier_id UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE RESTRICT,
    ticket_code VARCHAR(32) UNIQUE NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    holder_email VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    security_hash VARCHAR(64) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID UNIQUE NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    qr_payload TEXT NOT NULL,
    error_correction_level VARCHAR(4) NOT NULL DEFAULT 'M',
    format VARCHAR(16) NOT NULL DEFAULT 'SVG',
    version INTEGER NOT NULL DEFAULT 4,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);`}</pre>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
              Endpoint: POST /api/v1/tickets/generate-qr
            </h3>
            <pre className="pre-box">{`// Inbound Request Contract
{
  "eventId": "UUID (Required)",
  "tierId": "UUID (Required)",
  "holderName": "string [min 2, max 100] (Sanitized)",
  "holderEmail": "string [RFC 5322 Email] (Sanitized)",
  "seatNumber": "string (Optional)"
}

// 201 Created Response
{
  "success": true,
  "data": {
    "ticketId": "UUID",
    "ticketCode": "TCK-2026-XXXXX",
    "status": "ISSUED",
    "qrCode": {
      "payload": "TICKET:TCK-XXXX|EVT:XXXX|SIG:XXXX",
      "dataUrl": "data:image/png;base64,...",
      "securityHash": "hex-digest"
    }
  }
}`}</pre>
          </div>
        )}

        {activeTab === 'nfr' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
              Strict NFR & DoD Compliance Matrix
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              <li><strong>Accessibility (a11y):</strong> ARIA labels, semantic roles, focus indicators, keyboard navigable.</li>
              <li><strong>Security:</strong> DOMPurify and HTML tag strippers sanitize every text input prior to state inclusion.</li>
              <li><strong>Telemetry:</strong> Simulates enterprise logging ping to console: <code>[ANALYTICS] User interacted with Ticket QR Code Generator Worker</code>.</li>
              <li><strong>Offline/2G Handling:</strong> Local client-side QR generation engine prevents crashes during spotty connections.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
