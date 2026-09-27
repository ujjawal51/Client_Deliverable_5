# Ticket QR Code Generator Worker - API Contracts Specification
**Ticket ID:** DEL-10254  
**Epic:** Core Infrastructure Overhaul  
**Protocol:** REST / HTTP & Asynchronous Web Worker Protocol  
**Version:** v1.0.0  
**Specification Format:** OpenAPI 3.0 / Standard JSON Schema

---

## 1. Overview & Architectural Principles
The API Contracts define the deterministic boundary between client interfaces, floor worker agents, and central databases.

Key Guarantees:
- **Resilience to Spotty Connectivity:** Idempotency keys (`X-Idempotency-Key`) prevent duplicate ticket creation upon network timeouts.
- **Strict Data Sanitization:** All inbound strings undergo XSS sanitization (removing HTML injection vectors) prior to validation.
- **Telemetry Observability:** Simulated analytics headers and logging endpoints.
- **Standardized Error Responses:** RFC 7807 compliant problem details with exact field validation failure pointers.

---

## 2. API Endpoints

### 2.1. Generate Single Ticket QR Code
**`POST /api/v1/tickets/generate-qr`**

Generates a ticket record and creates a tamper-proof cryptographic QR payload.

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `string` | Yes | `application/json` |
| `X-Staff-ID` | `string` | Yes | Unique operator staff identifier |
| `X-Idempotency-Key` | `string` | Optional | Client UUID to prevent duplicates over 2G retries |

#### Request Payload
```json
{
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "tierId": "4bb96f75-6828-4673-c4fd-3da74e77bfb7",
  "holderName": "Sarah Connor",
  "holderEmail": "sarah.connor@cyberdyne.org",
  "seatNumber": "A-14",
  "notes": "VIP Floor Access Pass"
}
```

#### Field Constraints
- `eventId`: UUIDv4, must refer to an active event.
- `tierId`: UUIDv4, must have `quota > issued_count`.
- `holderName`: string, 2-100 characters, no HTML tags/scripts.
- `holderEmail`: valid RFC 5322 email string.
- `seatNumber`: optional string, max 20 chars.

#### Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "ticketId": "9fa85f64-5717-4562-b3fc-2c963f66afa1",
    "ticketCode": "TCK-2026-98124",
    "status": "ISSUED",
    "event": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Global Tech Summit 2026",
      "venue": "Convention Center Main Hall"
    },
    "tier": {
      "id": "4bb96f75-6828-4673-c4fd-3da74e77bfb7",
      "name": "VIP All-Access"
    },
    "holder": {
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne.org",
      "seatNumber": "A-14"
    },
    "qrCode": {
      "payload": "TICKET:TCK-2026-98124|EVT:3fa85f64|HOLDER:Sarah Connor|SIG:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "securityHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "generatedAt": "2026-09-26T10:35:00.000Z"
    }
  },
  "telemetry": {
    "logged": true,
    "traceId": "trc-88219481"
  }
}
```

#### Response: `400 Bad Request` (Invalid Input Validation Failure)
Offending fields highlighted in client state:
```json
{
  "success": false,
  "error": "VALIDATION_FAILED",
  "message": "Form submission rejected due to invalid or missing fields.",
  "errors": {
    "holderName": "Holder name is required and must be at least 2 characters.",
    "holderEmail": "Please provide a valid attendee email address."
  }
}
```

---

### 2.2. Query & Search Tickets
**`GET /api/v1/tickets`**

Retrieves issued tickets with filtering, search query matching, and pagination.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | `string` | No | `""` | Search substring across ticket code, holder name, or email |
| `eventId` | `string` | No | `null` | Filter by event UUID |
| `status` | `string` | No | `ALL` | `ALL`, `ISSUED`, `CHECKED_IN`, `VOID` |
| `page` | `integer` | No | `1` | Pagination page number |
| `limit` | `integer` | No | `20` | Items per page (max 100) |

#### Response: `200 OK` (Records Found)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "ticketId": "9fa85f64-5717-4562-b3fc-2c963f66afa1",
        "ticketCode": "TCK-2026-98124",
        "holderName": "Sarah Connor",
        "holderEmail": "sarah.connor@cyberdyne.org",
        "status": "ISSUED",
        "tierName": "VIP All-Access",
        "issuedAt": "2026-09-26T10:35:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 1,
      "limit": 20
    }
  }
}
```

#### Response: `200 OK` (Empty State - "No data found")
When search returns no matches or directory is unpopulated:
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalRecords": 0,
      "limit": 20
    }
  },
  "emptyStateMessage": "No data found matching your query."
}
```

---

### 2.3. Batch Worker QR Code Processing
**`POST /api/v1/worker/batch-generate`**

Allows floor staff to queue bulk ticket generation for offline caching or bulk credentials.

#### Request Payload
```json
{
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "tierId": "4bb96f75-6828-4673-c4fd-3da74e77bfb7",
  "records": [
    { "holderName": "Alice Johnson", "holderEmail": "alice@corp.internal" },
    { "holderName": "Bob Williams", "holderEmail": "bob@corp.internal" }
  ]
}
```

#### Response: `202 Accepted`
```json
{
  "success": true,
  "jobId": "job-550e8400-e29b-41d4-a716-446655440000",
  "status": "QUEUED",
  "totalQueued": 2,
  "estimatedDurationSec": 0.4
}
```

---

### 2.4. Telemetry Analytics Ingestion
**`POST /api/v1/telemetry`**

Captures client pings for floor worker diagnostics.

#### Request Payload
```json
{
  "action": "User interacted with Ticket QR Code Generator Worker",
  "eventType": "QR_GENERATION_SUCCESS",
  "details": {
    "ticketCode": "TCK-2026-98124",
    "networkLatencyMs": 42,
    "connectionType": "2g_simulated"
  }
}
```

#### Response: `200 OK`
```json
{
  "status": "ACK",
  "logged": true
}
```
