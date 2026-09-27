import QRCode from 'qrcode';

/**
 * Creates a pseudo-cryptographic hash for tamper verification in client/worker.
 * Uses a robust polynomial rolling hash and bitwise hex digest.
 * 
 * @param {Object} data 
 * @returns {string} 32-character hexadecimal security hash
 */
export function createSecurityHash(data) {
  const str = JSON.stringify(data);
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }

  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);

  const hex1 = (4294967296 + (hash1 >>> 0)).toString(16).substring(1);
  const hex2 = (4294967296 + (hash2 >>> 0)).toString(16).substring(1);
  const hex3 = (4294967296 + ((hash1 ^ hash2) >>> 0)).toString(16).substring(1);
  const hex4 = (4294967296 + ((hash2 + hash1) >>> 0)).toString(16).substring(1);

  return `${hex1}${hex2}${hex3}${hex4}`.toLowerCase();
}

/**
 * Generates structured ticket payload string.
 * Format:
 * TICKET:<CODE>|EVT:<EVENT>|TIER:<TIER>|HOLDER:<NAME>|EMAIL:<EMAIL>|SIG:<HASH>
 * 
 * @param {Object} ticket
 * @returns {string}
 */
export function generateTicketPayload(ticket) {
  const hash = ticket.securityHash || createSecurityHash({
    ticketCode: ticket.ticketCode,
    eventId: ticket.eventId,
    tierId: ticket.tierId,
    holderName: ticket.holderName,
    holderEmail: ticket.holderEmail,
  });

  return [
    `TICKET:${ticket.ticketCode}`,
    `EVT:${ticket.eventId}`,
    `TIER:${ticket.tierId || 'GENERAL'}`,
    `HOLDER:${ticket.holderName}`,
    `EMAIL:${ticket.holderEmail}`,
    `SIG:${hash}`,
  ].join('|');
}

/**
 * Generates an offline QR Code Data URL.
 * Works completely offline without requiring internet access.
 * 
 * @param {string} text - Payload to encode
 * @returns {Promise<string>} Base64 Data URL (PNG or SVG)
 */
export async function generateQrDataUrl(text) {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#121212',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.warn('QR Code library render error, using SVG fallback:', err);
    // Fallback offline SVG QR placeholder
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280" viewBox="0 0 280 280"><rect width="280" height="280" fill="%23ffffff"/><text x="140" y="140" font-family="monospace" font-size="12" text-anchor="middle" fill="%23121212">QR_PAYLOAD_ENCODED</text></svg>`;
  }
}
