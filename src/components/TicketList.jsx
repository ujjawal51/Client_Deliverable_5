import React, { useState } from 'react';
import { Search, Eye, Inbox } from 'lucide-react';
import { logTelemetry } from '../utils/telemetry';

export default function TicketList({ tickets, onSelectTicket, activeTicketId }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      logTelemetry('SEARCH_TICKETS', { query: query.trim() });
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.holderName.toLowerCase().includes(q) ||
      t.holderEmail.toLowerCase().includes(q) ||
      t.ticketCode.toLowerCase().includes(q)
    );
  });

  return (
    <section className="corporate-card" aria-label="Issued Tickets Directory">
      <div className="card-header">
        <div>
          <h2 className="card-title">Issued Tickets Directory</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Total Issued: {tickets.length} credential(s)
          </span>
        </div>
        <span className="badge">Floor Roster</span>
      </div>

      <div className="form-group" style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search tickets by name, email, or code..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search tickets by name, email, or code"
        />
        <Search
          size={16}
          style={{
            position: 'absolute',
            right: '16px',
            top: '14px',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </div>

      {filteredTickets.length === 0 ? (
        <div className="empty-state" role="region" aria-label="Empty State Notification">
          <Inbox size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} aria-hidden="true" />
          <h3 className="empty-state-title">No data found</h3>
          <p className="empty-state-desc">
            {searchQuery
              ? `No ticket records match query "${searchQuery}". Please verify spelling or clear search.`
              : 'No tickets issued yet. Fill the issuance form above to generate your first credential.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="ticket-table" aria-label="Tickets Table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Attendee</th>
                <th scope="col">Tier</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const isActive = activeTicketId === t.id;
                return (
                  <tr
                    key={t.id}
                    style={{
                      backgroundColor: isActive ? 'var(--color-subtle)' : undefined,
                      fontWeight: isActive ? '700' : 'normal',
                    }}
                  >
                    <td>
                      <code>{t.ticketCode}</code>
                    </td>
                    <td>
                      <div>{t.holderName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t.holderEmail}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ padding: '2px 6px', fontSize: '10px' }}>
                        {t.tierId}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase' }}>{t.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                        onClick={() => {
                          onSelectTicket(t);
                          logTelemetry('VIEW_TICKET_DETAILS', { ticketCode: t.ticketCode });
                        }}
                        aria-label={`View QR code and details for ${t.ticketCode}`}
                      >
                        <Eye size={12} aria-hidden="true" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
