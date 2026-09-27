import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { sanitizeInput } from '../src/utils/sanitizer';
import { generateTicketPayload, createSecurityHash } from '../src/utils/qr-engine';
import { logTelemetry } from '../src/utils/telemetry';

describe('Ticket QR Code Generator Worker - Acceptance Criteria & NFR Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Agile User Stories (The "Happy Path")', () => {
    it('renders the Ticket QR Code Generator Worker interface clearly', () => {
      render(<App />);
      expect(screen.getByRole('heading', { name: /Ticket QR Code Generator Worker/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Attendee Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Attendee Email Address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Ticket QR Code/i })).toBeInTheDocument();
    });

    it('generates a ticket QR code immediately with consistent, structured output', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(<App />);

      const nameInput = screen.getByLabelText(/Attendee Full Name/i);
      const emailInput = screen.getByLabelText(/Attendee Email Address/i);
      const submitBtn = screen.getByRole('button', { name: /Generate Ticket QR Code/i });

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Ticket Generated Successfully/i)).toBeInTheDocument();
      });

      // Verification of consistent data structure
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('jane.doe@example.com').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/TCK-2026-/i).length).toBeGreaterThanOrEqual(1);

      // Check QR preview canvas/image exists
      const qrImage = screen.getByAltText(/Generated QR Code for Ticket/i);
      expect(qrImage).toBeInTheDocument();
    });

    it('payload generator returns consistent, tamper-proof schema with security hash', () => {
      const ticketData = {
        ticketCode: 'TCK-2026-TEST1',
        eventId: 'EVT-GLOBAL-2026',
        tierId: 'TIER-VIP',
        holderName: 'Jane Doe',
        holderEmail: 'jane.doe@example.com',
      };

      const hash = createSecurityHash(ticketData);
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(16);

      const payload = generateTicketPayload(ticketData);
      expect(payload).toContain('TCK-2026-TEST1');
      expect(payload).toContain('Jane Doe');
      expect(payload).toContain(hash);
    });
  });

  describe('2. The "Unhappy Path" (Edge Case Handling)', () => {
    it('Empty States: displays user-friendly "No data found" message when search returns no results', async () => {
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search tickets by name, email, or code/i);
      fireEvent.change(searchInput, { target: { value: 'non_existent_record_xyz_123' } });

      await waitFor(() => {
        const emptyState = screen.getByText(/No data found/i);
        expect(emptyState).toBeInTheDocument();
      });
    });

    it('Invalid Inputs: prevents form submission and highlights offending fields in red', async () => {
      render(<App />);

      const submitBtn = screen.getByRole('button', { name: /Generate Ticket QR Code/i });
      const nameInput = screen.getByLabelText(/Attendee Full Name/i);
      const emailInput = screen.getByLabelText(/Attendee Email Address/i);

      // Attempt to submit empty form
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Verify visual red highlight indicator
      expect(nameInput.className).toContain('field-error');
      expect(emailInput.className).toContain('field-error');
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();

      // Malformed email
      fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email-format' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('Bad Connectivity: shows visual loading indicator during asynchronous operations', async () => {
      render(<App />);

      // Enable slow 2G simulation toggle
      const slowNetToggle = screen.getByLabelText(/Simulate Slow 2G Network/i);
      fireEvent.click(slowNetToggle);

      const nameInput = screen.getByLabelText(/Attendee Full Name/i);
      const emailInput = screen.getByLabelText(/Attendee Email Address/i);
      const submitBtn = screen.getByRole('button', { name: /Generate Ticket QR Code/i });

      fireEvent.change(nameInput, { target: { value: 'Network Test' } });
      fireEvent.change(emailInput, { target: { value: 'net.test@example.com' } });
      fireEvent.click(submitBtn);

      // Visual loading indicator must be present during async generation
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Generating Ticket QR Code/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Ticket Generated Successfully/i)).toBeInTheDocument();
      }, { timeout: 3500 });
    });
  });

  describe('3. Non-Functional Requirements (NFRs)', () => {
    it('Accessibility (a11y): all interactive controls have accessible ARIA labels and roles', () => {
      render(<App />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(btn => {
        const ariaLabel = btn.getAttribute('aria-label') || btn.textContent;
        expect(ariaLabel).toBeTruthy();
      });

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });
    });

    it('Telemetry Simulation: logs `[ANALYTICS] User interacted with Ticket QR Code Generator Worker` on primary actions', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logTelemetry('TEST_ACTION', { detail: 'unit test' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ANALYTICS] User interacted with Ticket QR Code Generator Worker')
      );

      // Trigger via UI action
      render(<App />);
      const nameInput = screen.getByLabelText(/Attendee Full Name/i);
      const emailInput = screen.getByLabelText(/Attendee Email Address/i);
      const submitBtn = screen.getByRole('button', { name: /Generate Ticket QR Code/i });

      fireEvent.change(nameInput, { target: { value: 'Telemetry User' } });
      fireEvent.change(emailInput, { target: { value: 'telemetry@corp.local' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ANALYTICS] User interacted with Ticket QR Code Generator Worker')
        );
      });
    });

    it('Security: sanitizes all text inputs against XSS injection before storing in state', () => {
      const maliciousScript = '<script>alert("XSS Attack")</script>John Wick';
      const maliciousImage = '<img src=x onerror=alert(1)>Bruce Wayne';
      const maliciousIframe = '<iframe src="javascript:alert(1)"></iframe>Clark Kent';

      const sanitizedScript = sanitizeInput(maliciousScript);
      const sanitizedImage = sanitizeInput(maliciousImage);
      const sanitizedIframe = sanitizeInput(maliciousIframe);

      expect(sanitizedScript).not.toContain('<script>');
      expect(sanitizedScript).toContain('John Wick');

      expect(sanitizedImage).not.toContain('onerror');
      expect(sanitizedImage).toContain('Bruce Wayne');

      expect(sanitizedIframe).not.toContain('<iframe');
      expect(sanitizedIframe).toContain('Clark Kent');
    });
  });
});
