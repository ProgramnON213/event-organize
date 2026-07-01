# HCMUT Event Organizing Web Application

A web application for organizing campus events at Ho Chi Minh City University of Technology (HCMUT). Built using React, Vite, and TypeScript, it allows students to register and check in/out of events, organizers to manage events and attendance, and admins to approve event requests.

---

> [!NOTE]
> **AI Agent Quick Reference Guide**: This repository is structured to be LLM/agent-friendly. Below is the layout, design guidelines, state system, and storage structures to help you get up to speed instantly.

---

## Technical Architecture & Sitemap

```
├── .agents/
│   └── AGENTS.md            # Project-specific rules and instructions
├── src/
│   ├── types.ts             # Global TypeScript interfaces
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Custom CSS & HCMUT Design Tokens
│   ├── App.tsx              # View router and current active user state
│   ├── components/
│   │   ├── Navbar.tsx       # HCMUT Brand Header & Role Switcher Dropdown
│   │   ├── EventCard.tsx    # Card listing event info & actions based on active role
│   │   ├── StudentDashboard.tsx   # Register for events & scan dynamic keys (check-in/out)
│   │   ├── OrganizerDashboard.tsx # Create events, track attendance & show dynamic QR codes
│   │   └── AdminDashboard.tsx     # Review pending approvals & global metrics
│   └── utils/
│       ├── storage.ts       # LocalStorage helpers & state updates
│       └── mockData.ts      # Initial pre-populated seed data
```

### Key Modules
1. [types.ts](file:///d:/Download/event-organize/src/types.ts): All database records and model structures.
2. [storage.ts](file:///d:/Download/event-organize/src/utils/storage.ts): Custom storage state provider. Contains logic for validating presence check-in/out.
3. [index.css](file:///d:/Download/event-organize/src/index.css): Implements the HCMUT brand theme.

---

## State Flow & QR Security System

The check-in/out mechanism requires proof of physical presence at the event. It runs on a dynamic keys protocol:

```mermaid
sequenceDiagram
    participant Organizer
    participant Storage
    participant Student
    
    Organizer->>Storage: Click "Show QR Code" (Generates initial qrKey)
    Storage-->>Organizer: displays QR + Key (e.g. "A5F3B9")
    Note over Organizer: Periodically click "Regenerate Key" to expire old keys
    Student->>Organizer: physically scans/views QR
    Student->>Storage: Submits key ("A5F3B9") via scanner simulator
    alt Key Matches Current qrKey
        Storage->>Storage: Mark Student checkInTime = Date.now()
        Storage-->>Student: Success: Checked In
    else Key Is Expired / Invalid
        Storage-->>Student: Error: Invalid QR Code
    end
```

### Event Lifecycle Status
- `pending`: Newly created events by organizers. Hidden from students; visible to admins.
- `approved`: Validated by admin. Visible to students for registration.
- `rejected`: Declined by admin. Invisible to students; archived in history.

---

## Local Storage Schemas

Data is serialized to JSON and persisted under these keys:

### `hcmut_events`
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date-time string
  location: string;
  organizerId: string;
  status: 'pending' | 'approved' | 'rejected';
  maxParticipants: number;
  bannerUrl?: string;
  qrKey?: string;         // Current valid check-in token (6-char alphanumeric)
  qrGeneratedAt?: number;  // Timestamp of token generation
}
```

### `hcmut_registrations`
```typescript
interface Registration {
  id: string;
  studentId: string;
  eventId: string;
  registeredAt: number;   // Epoch timestamp
  checkInTime?: number;    // Epoch timestamp (if checked in)
  checkOutTime?: number;   // Epoch timestamp (if checked out)
}
```

---

## Design System (HCMUT theme)

The design is customized using CSS custom properties defined in [index.css](file:///d:/Download/event-organize/src/index.css):
- **Primary Brand Color**: `--hcmut-blue-light: #1488D8;` (used for standard buttons, highlights)
- **Secondary Brand Color**: `--hcmut-blue-dark: #030391;` (used for navbar branding, titles, card headers)
- **Accent Highlight**: `--hcmut-accent: #fca903;` (used for gold accents, alerts, notices)
- **Font-Family**: `'Inter', sans-serif` loaded from Google Fonts.

---

## Developer Operations

### Installing Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Building / Type-checking
```bash
npm run build
```
This runs `tsc -b` and compiling client production assets. Always verify typecheck passes before pushing changes.
