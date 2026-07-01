# HCMUT Event Organizing Web Application

A web application designed for organizing events at Ho Chi Minh City University of Technology (HCMUT). Built using React, Vite, and TypeScript, it allows students to register and check in/out of events, organizers to manage events and attendance, and admins to approve event requests.

## Features

- **Role Switching**: Switch between **Student**, **Organizer**, and **Admin** profiles from the navbar.
- **Student Dashboard**:
  - Browse and register for approved events.
  - Scan check-in and check-out using dynamic key authorization.
- **Organizer Dashboard**:
  - Create new events (submits for Admin approval).
  - View real-time attendance logs (check-in and check-out times).
  - Generate dynamic check-in/out QR codes that update on command to prevent remote scanning abuse.
- **Admin Dashboard**:
  - Approve or reject pending event proposals.
  - View historical events.

## Tech Stack

- **Framework**: React 18, Vite, TypeScript
- **Styling**: Custom CSS (Vanilla) implementing HCMUT Branding Guidelines
- **Icons**: Lucide React
- **QR Codes**: `qrcode.react`
- **Database**: Local Storage (data is persistent on browser refresh)

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system.

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the browser and visit `http://localhost:5173` (or the port specified by Vite).

## HCMUT Branding Color Guide
- Primary Blue: `#1488D8`
- Secondary Blue: `#030391`
- Gold Accent: `#fca903`
