import React, { useState, useEffect } from 'react';
import TicketForm from './components/TicketForm';
import TicketCard from './components/TicketCard';
import TicketList from './components/TicketList';
import NetworkSimulator from './components/NetworkSimulator';
import ArchitectureModal from './components/ArchitectureModal';
import { logTelemetry } from './utils/telemetry';
import { createSecurityHash, generateTicketPayload, generateQrDataUrl } from './utils/qr-engine';
import { Shield, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'floor_worker_tickets_v1';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // Initialize with sample records if local storage is unpopulated
  useEffect(() => {
    const initializeData = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setTickets(parsed);
          if (parsed.length > 0) {
            setActiveTicket(parsed[0]);
          }
          return;
        }

        // Default initial records for floor demo
        const defaultSample = {
          id: 'tck-sample-1',
          ticketCode: 'TCK-2026-10492',
          eventId: 'EVT-GLOBAL-2026',
          tierId: 'VIP',
          holderName: 'Alex Mercer',
          holderEmail: 'alex.mercer@corp.global',
          seatNumber: 'VIP Lounge A-01',
          status: 'ISSUED',
          issuedAt: new Date().toISOString(),
        };

        const hash = createSecurityHash(defaultSample);
        defaultSample.securityHash = hash;
        const payload = generateTicketPayload(defaultSample);
        defaultSample.qrPayload = payload;
        defaultSample.qrDataUrl = await generateQrDataUrl(payload);

        setTickets([defaultSample]);
        setActiveTicket(defaultSample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultSample]));
      } catch (e) {
        console.warn('Initialization note:', e);
      }
    };

    initializeData();
  }, []);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => {
      const updated = [newTicket, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
      return updated;
    });
    setActiveTicket(newTicket);
  };

  const handleSelectTicket = (ticket) => {
    setActiveTicket(ticket);
  };

  const handleToggleSlowNetwork = (enabled) => {
    setIsSlowNetwork(enabled);
    logTelemetry('TOGGLE_SLOW_NETWORK', { enabled });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1 className="brand-title">Ticket QR Code Generator Worker</h1>
          <p className="brand-subtitle">Floor Staff Operational Credential & QR Issuance System</p>
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              logTelemetry('OPEN_ARCHITECTURE_MODAL');
              setIsArchModalOpen(true);
            }}
            aria-label="View Capstone Architecture and Schema"
          >
            <BookOpen size={14} aria-hidden="true" />
            <span>Architecture & Schema</span>
          </button>

          <span className="badge" title="Authenticated Operator">
            <Shield size={12} aria-hidden="true" />
            <span>Staff ID: OP-4192</span>
          </span>
        </div>
      </header>

      {/* Network Simulator Controls */}
      <NetworkSimulator
        isSlowNetwork={isSlowNetwork}
        onToggleSlowNetwork={handleToggleSlowNetwork}
        isGenerating={isGenerating}
      />

      {/* Main Two-Column Corporate Layout */}
      <main className="main-layout">
        {/* Left Column: Form & Active Ticket Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
          <TicketForm
            onTicketCreated={handleTicketCreated}
            isSlowNetwork={isSlowNetwork}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />

          {activeTicket && <TicketCard ticket={activeTicket} />}
        </div>

        {/* Right Column: Ticket Roster & Search (with Empty States) */}
        <div>
          <TicketList
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            activeTicketId={activeTicket ? activeTicket.id : null}
          />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'var(--space-48)',
          paddingTop: 'var(--space-16)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <strong>DEL-10254</strong> | Epic: Core Infrastructure Overhaul | Reporter: Amit Sharma (Senior Staff Engineer)
        </div>
        <div>
          Offline-First Worker | Monochromatic Design System | 100% Lighthouse A11y Standards
        </div>
      </footer>

      {/* Capstone Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
