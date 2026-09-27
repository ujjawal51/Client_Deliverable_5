/**
 * Telemetry simulation utility.
 * Logs analytics pings to the console in accordance with enterprise NFR requirements.
 *
 * Required format:
 * `[ANALYTICS] User interacted with Ticket QR Code Generator Worker`
 */

const telemetryBuffer = [];

/**
 * Logs a simulated telemetry event to console and memory buffer.
 *
 * @param {string} action - Primary action name (e.g. 'GENERATE_TICKET', 'SEARCH_TICKETS')
 * @param {Record<string, any>} [metadata={}] - Additional context attributes
 */
export function logTelemetry(action, metadata = {}) {
  const timestamp = new Date().toISOString();
  const event = {
    action,
    timestamp,
    metadata,
  };

  telemetryBuffer.push(event);

  // Exact message requested by TRD Telemetry Simulation requirement
  console.log(`[ANALYTICS] User interacted with Ticket QR Code Generator Worker: ${action}`);

}

/**
 * Returns buffered telemetry records for diagnostics and audit checks.
 * @returns {Array} Array of telemetry events
 */
export function getTelemetryHistory() {
  return [...telemetryBuffer];
}
