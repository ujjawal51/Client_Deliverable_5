# Ticket QR Code Generator Worker (DEL-10254)

[![Epic: Core Infrastructure Overhaul](https://img.shields.io/badge/Epic-Core%20Infrastructure%20Overhaul-black.svg)](#)
[![Priority: P1](https://img.shields.io/badge/Priority-P1%20High-black.svg)](#)
[![Story Points: 5](https://img.shields.io/badge/Story%20Points-5-black.svg)](#)
[![Accessibility: 100%](https://img.shields.io/badge/a11y-100%25%20Lighthouse-black.svg)](#)
[![TDD: Vitest](https://img.shields.io/badge/TDD-Vitest-black.svg)](#)

> **Context:** The client's floor staff previously managed ticket QR code generation using error-prone manual paper systems and Excel spreadsheets, leading to data loss and operational bottlenecks. This enterprise digital **Ticket QR Code Generator Worker** delivers offline-resilient, tamper-proof credential issuance that floor staff can pull up instantly without crashes—even over spotty 2G connections.

---

## 🏛️ Architectural Stage: Capstone 1 Deliverables
Per the Technical Implementation Notes:
- **Definitive Database Schema (ERD & PostgreSQL DDL):** Documented in [`SCHEMA.md`](file:///c:/Users/ujjaw/OneDrive/Desktop/Client_Deliverable_5/SCHEMA.md).
- **Comprehensive API Contracts:** Documented in [`docs/API_CONTRACTS.md`](file:///c:/Users/ujjaw/OneDrive/Desktop/Client_Deliverable_5/docs/API_CONTRACTS.md).
- **Prompt Traceability Log:** Documented in [`PROMPTS.md`](file:///c:/Users/ujjaw/OneDrive/Desktop/Client_Deliverable_5/PROMPTS.md).

---

## 🚀 Key Features

### 1. Agile User Stories (Happy Path)
- **Instant Floor Access:** High-contrast, clean corporate UI optimized for rapid ticket creation at venue gates.
- **Immediate Response:** Client-side zero-latency QR code engine generates vector/canvas QR payloads in milliseconds without network bottlenecks.
- **Consistent Data Structure:** Standardized ticket payloads encoded with cryptographic signatures (`TCK-2026-XXXXX|EVT|TIER|HOLDER|SIG`).

### 2. Edge Case Handling (The "Unhappy Path")
- **Empty States:** When queries yield 0 results, displays an intuitive and user-friendly **"No data found"** message (never a blank screen).
- **Bad Connectivity Resilience:** Built-in **Simulate Slow 2G Network (2.5s Latency)** toggle with visual loading indicators (`role="status"`, animated spinner) during all asynchronous cycles.
- **Invalid Input Prevention:** Invalid or missing required inputs immediately halt submission, activate `aria-invalid="true"`, and **highlight offending fields in red** with actionable error descriptions.

### 3. Non-Functional Requirements (NFRs)
- **100% Accessibility (a11y):** Full keyboard navigability, explicit ARIA labels (`aria-label`, `aria-required`, `aria-describedby`), semantic HTML5 elements.
- **Telemetry Simulation:** Emits simulated enterprise analytics logs to the console upon every primary action:  
  `[ANALYTICS] User interacted with Ticket QR Code Generator Worker: <ACTION>`
- **Strict XSS Sanitization:** All text inputs are filtered through multi-stage sanitization (DOMPurify + tag/script strip) before state storage.
- **Monochromatic Corporate Design System:** Built with strict grayscale tokens (`#ffffff`, `#f8f9fa`, `#ced4da`, `#212529`, `#121212`) and 16px/32px spacing steps. Only functional red is permitted for invalid field states.

---

## 🛠️ Tech Stack & Scripts

- **Runtime:** Node.js v22+
- **Frontend / Framework:** React 19, Vite 6
- **Test Runner:** Vitest + React Testing Library + JSDOM
- **Security:** DOMPurify
- **QR Generation:** QRCode (Offline Canvas/SVG Engine)
- **Icons:** Lucide React

### Available Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:3000` |
| `npm test` | Runs the full Vitest TDD test suite |
| `npm run build` | Compiles optimized production bundle |
| `npm run lint` | Runs ESLint validation |
| `npm run preview` | Previews production build locally |

---

## ✅ Definition of Done (DoD) Checklist

- [x] Code compiles and runs successfully without fatal errors (`npm run build`).
- [x] Passes Linting (Zero ESLint warnings, no unused imports).
- [x] Matches all Happy and Unhappy Path Acceptance Criteria.
- [x] The `PROMPTS.md` file is included in the root directory.
- [x] No real API keys or sensitive PII are hardcoded in the source.
