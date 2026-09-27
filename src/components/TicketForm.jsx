import React, { useState } from 'react';
import { QrCode, RefreshCw } from 'lucide-react';
import { sanitizeInput } from '../utils/sanitizer';
import { createSecurityHash, generateTicketPayload, generateQrDataUrl } from '../utils/qr-engine';
import { logTelemetry } from '../utils/telemetry';

export default function TicketForm({ onTicketCreated, isSlowNetwork, isGenerating, setIsGenerating }) {
  const [formData, setFormData] = useState({
    holderName: '',
    holderEmail: '',
    tierId: 'VIP',
    seatNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const errs = {};
    if (!data.holderName || data.holderName.trim().length < 2) {
      errs.holderName = 'Full name is required (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.holderEmail || !emailRegex.test(data.holderEmail.trim())) {
      errs.holderEmail = 'Please enter a valid email address.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize immediately before storing in state against XSS injection
    const sanitized = sanitizeInput(value);
    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const currentErrors = validate(formData);
    if (currentErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: currentErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      holderName: true,
      holderEmail: true,
      tierId: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      logTelemetry('FORM_VALIDATION_FAILED', { errors: validationErrors });
      return;
    }

    setIsGenerating(true);

    const latencyMs = isSlowNetwork ? 2500 : 0;

    const processTicket = async () => {
      try {
        const ticketCode = `TCK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const eventId = 'EVT-GLOBAL-2026';

        const rawTicket = {
          id: `tck-${Date.now()}`,
          ticketCode,
          eventId,
          tierId: formData.tierId,
          holderName: formData.holderName,
          holderEmail: formData.holderEmail,
          seatNumber: formData.seatNumber || 'General Admission',
          status: 'ISSUED',
          issuedAt: new Date().toISOString(),
        };

        const securityHash = createSecurityHash(rawTicket);
        rawTicket.securityHash = securityHash;

        const qrPayload = generateTicketPayload(rawTicket);
        rawTicket.qrPayload = qrPayload;

        const qrDataUrl = await generateQrDataUrl(qrPayload);
        rawTicket.qrDataUrl = qrDataUrl;

        onTicketCreated(rawTicket);

        logTelemetry('GENERATE_TICKET_SUCCESS', {
          ticketCode: rawTicket.ticketCode,
          tier: rawTicket.tierId,
          latencyMs,
          connectionType: isSlowNetwork ? '2g_simulated' : 'fast',
        });

        // Clear form after successful creation
        setFormData({
          holderName: '',
          holderEmail: '',
          tierId: 'VIP',
          seatNumber: '',
        });
        setErrors({});
        setTouched({});
      } finally {
        setIsGenerating(false);
      }
    };

    if (latencyMs > 0) {
      setTimeout(processTicket, latencyMs);
    } else {
      await processTicket();
    }
  };

  const handleReset = () => {
    setFormData({
      holderName: '',
      holderEmail: '',
      tierId: 'VIP',
      seatNumber: '',
    });
    setErrors({});
    setTouched({});
    logTelemetry('FORM_RESET');
  };

  return (
    <section className="corporate-card" aria-label="Ticket Issuance Form">
      <div className="card-header">
        <h2 className="card-title">Issue New Ticket & QR Code</h2>
        <span className="badge">Floor Worker Form</span>
      </div>

      {isGenerating && (
        <div className="loading-indicator" role="status" aria-live="assertive">
          <div className="spinner" aria-hidden="true" />
          <span>Generating Ticket QR Code... (Simulating Network Round-Trip)</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="holderName">
            Attendee Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="holderName"
            name="holderName"
            type="text"
            className={`form-input ${errors.holderName ? 'field-error' : ''}`}
            placeholder="e.g. Jane Doe"
            value={formData.holderName}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-label="Attendee Full Name"
            aria-required="true"
            aria-invalid={errors.holderName ? 'true' : 'false'}
            aria-describedby={errors.holderName ? 'holderName-error' : undefined}
            disabled={isGenerating}
          />
          {errors.holderName && (
            <span id="holderName-error" className="error-message" role="alert">
              {errors.holderName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="holderEmail">
            Attendee Email Address <span aria-hidden="true">*</span>
          </label>
          <input
            id="holderEmail"
            name="holderEmail"
            type="email"
            className={`form-input ${errors.holderEmail ? 'field-error' : ''}`}
            placeholder="e.g. jane.doe@example.com"
            value={formData.holderEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-label="Attendee Email Address"
            aria-required="true"
            aria-invalid={errors.holderEmail ? 'true' : 'false'}
            aria-describedby={errors.holderEmail ? 'holderEmail-error' : undefined}
            disabled={isGenerating}
          />
          {errors.holderEmail && (
            <span id="holderEmail-error" className="error-message" role="alert">
              {errors.holderEmail}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tierId">
              Ticket Tier
            </label>
            <select
              id="tierId"
              name="tierId"
              className="form-select"
              value={formData.tierId}
              onChange={handleChange}
              aria-label="Ticket Tier Selection"
              disabled={isGenerating}
            >
              <option value="VIP">VIP All-Access</option>
              <option value="GENERAL">General Admission</option>
              <option value="FLOOR">Floor Pass</option>
              <option value="STAFF">Staff Credential</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="seatNumber">
              Seat / Gate (Optional)
            </label>
            <input
              id="seatNumber"
              name="seatNumber"
              type="text"
              className="form-input"
              placeholder="e.g. Sec 102, Row B"
              value={formData.seatNumber}
              onChange={handleChange}
              aria-label="Seat or Gate Assignment"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-16)', marginTop: 'var(--space-16)' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={isGenerating}
            aria-label="Generate Ticket QR Code"
          >
            <QrCode size={16} aria-hidden="true" />
            <span>{isGenerating ? 'Processing...' : 'Generate Ticket QR Code'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isGenerating}
            aria-label="Reset Form"
            style={{ flex: 1 }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </form>
    </section>
  );
}
