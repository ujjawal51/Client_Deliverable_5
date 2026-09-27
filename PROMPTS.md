# Prompt Traceability Log (PROMPTS.md)
**Ticket ID:** DEL-10254  
**Epic:** Core Infrastructure Overhaul  
**Feature:** Ticket QR Code Generator Worker  
**Engineer / Lead:** Floor Infrastructure Engineering Team  
**Evaluation Standard:** AI-Assisted Software Engineering (Vibe Coding Workflow)

---

## Overview
This document logs the exact sequence of prompts, acceptance verification loops, and architectural guidance supplied to the Antigravity AI assistant to engineer the Ticket QR Code Generator Worker.

In accordance with the project guidelines:
1. **Test-Driven Development (TDD):** Test suites covering the Happy Path, Unhappy Path (Edge Cases), and Non-Functional Requirements (NFRs) were authored first before implementation.
2. **Monochromatic Corporate Design System:** Explicit instructions to prevent rogue hex colors, maintaining 16px/32px steps and 100% accessibility.
3. **Definitive Planning & Schema:** ERD and API Contracts drafted in adherence to Capstone 1 technical implementation notes.
4. **Resilience to Spotty Connectivity:** Edge cases for 2G network simulation, empty states, and invalid input highlighting in red were systematically verified.

---

## Prompt Sequence Log

### Prompt 1: Project Intake, TRD Ingestion & Architectural Constraints
```text
Act as a Principal Staff Software Engineer. Ingest the following Ticket Metadata and Technical Requirements Document (TRD) for Ticket ID DEL-10254:
- Context: Client floor staff currently rely on manual paper systems and Excel sheets causing data loss and operational slowdowns.
- Goal: Build a digital Ticket QR Code Generator Worker that floor staff can pull up easily.
- Architectural Constraints:
  1. Draft the definitive database schema (ERD) with Mermaid and PostgreSQL DDL.
  2. Outline the complete REST & Worker API contracts with request/response schemas.
  3. Adhere strictly to a clean, monochromatic corporate design system (grayscale palette, strict 16px/32px padding, no rogue colors except required validation red).
  4. Ensure full offline / spotty internet resilience so operations never crash on floor staff.
Please start by drafting SCHEMA.md and docs/API_CONTRACTS.md.
```
**Outcome:** Produced `SCHEMA.md` (containing entity relationship diagram, relational table specs, performance indexes, and PostgreSQL DDL) and `docs/API_CONTRACTS.md` (OpenAPI specification for ticket generation, query/search empty states, batch worker queuing, and telemetry logging).

---

### Prompt 2: Test-Driven Development (TDD) Suite Formulation
```text
In accordance with Step 1 of the Vibe Coding Workflow:
"Do not ask the AI to write the final code immediately.
1. Feed the Acceptance Criteria and NFRs to Antigravity.
2. Instruct the AI to write the test suite first (using Vitest) to verify those criteria.
3. Once the tests are written (and failing), instruct the AI to write the actual implementation to make the tests pass."

Write the comprehensive Vitest test suite in tests/ticket-qr-worker.test.jsx verifying:
1. Agile User Stories (Happy Path):
   - Access interface cleanly and generate standard QR code.
   - Immediate response without long loading screens.
   - Consistent data structure in generated ticket and QR payload.
2. Unhappy Path (Edge Cases):
   - Empty States: Show user-friendly "No data found" message when search/filter returns empty, never a blank screen.
   - Bad Connectivity: Visual loading indicator during async operations and slow 2G simulation.
   - Invalid Inputs: Form submission prevented when required fields are missing/malformed; offending fields highlighted in red with aria-invalid="true".
3. Non-Functional Requirements (NFRs):
   - Accessibility (a11y): ARIA labels on all interactive elements, keyboard navigable.
   - Telemetry Simulation: Console spy asserts `[ANALYTICS] User interacted with Ticket QR Code Generator Worker` upon primary actions.
   - Security: Sanitize all inputs against XSS injection before storing in state (e.g., stripping <script> and malicious event handlers).
```
**Outcome:** Formulated failing test suite asserting all functional and non-functional requirements.

---

### Prompt 3: Implementation of Ticket QR Code Generator Worker Core Logic & UI
```text
Now write the actual implementation to make all tests pass:
1. Create src/utils/sanitizer.js: Robust XSS sanitization utilizing DOMPurify/HTML entity encoding.
2. Create src/utils/telemetry.js: Telemetry logger printing `[ANALYTICS] User interacted with Ticket QR Code Generator Worker: <Action>`.
3. Create src/utils/qr-engine.js: Tamper-proof HMAC/checksum ticket payload generation and offline client-side QR renderer.
4. Create src/components/TicketForm.jsx: Accessible form with red error highlights on invalid fields, live validation, and submission handler.
5. Create src/components/TicketList.jsx: Searchable ticket ledger with empty state "No data found" handling.
6. Create src/components/NetworkSimulator.jsx: Visual loading indicator and 2G latency toggle.
7. Create src/components/ArchitectureModal.jsx: Interactive viewer for Database Schema and API Contracts.
8. Create src/App.jsx & src/index.css: Monochromatic corporate design system (pure grayscale, 16px/32px spacing, high contrast, WCAG AAA compliant).
```
**Outcome:** Implemented components, utils, design system, and state management.

---

### Prompt 4: Quality Assurance, Verification & DoD Checklist
```text
Verify against the Definition of Done (DoD) Checklist:
- Run Vitest suite: Confirm 100% passing tests with zero regressions.
- Run ESLint: Ensure zero ESLint warnings and no unused imports.
- Run Vite production build: Ensure zero compile errors.
- Confirm PROMPTS.md is located in the repository root.
- Confirm zero hardcoded secrets or API keys exist in the codebase.
```
**Outcome:** All tests pass, build compiles cleanly, and DoD criteria are fully satisfied.
