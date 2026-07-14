# Simple CRM – Lead & Follow-Up Tracker

## Overview
A lightweight CRM tool for individuals and small teams to capture, organize, and track sales leads. No backend required — all data stored in browser localStorage.

## Features
- Add, edit, and delete leads with full contact details
- Pipeline status tracking (New → Contacted → Qualified → Proposal Sent → Won/Lost)
- Log follow-up activities (call, email, meeting) with notes
- Set next follow-up dates with overdue highlighting
- Real-time search by name or company
- Sortable columns in the lead list
- Fully offline — no server or account required
- Responsive design (mobile + desktop)

## Tech Stack
- React 18 + Vite 5
- React Router v6 (hash-based routing)
- Tailwind CSS v3
- Lucide React icons
- localStorage for persistence

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

## Local Development
```bash
git clone <repo-url>
cd simple-crm
npm install
npm run dev
```
Open http://localhost:5173

## Build
```bash
npm run build
```
Output: `dist/` directory ready for static hosting.

## Project Structure
```
src/
  lib/          # Data models, storage, utilities
  components/   # Reusable UI components
  pages/        # Route-level page components
  index.css     # Tailwind directives
  main.jsx      # App entry point
  App.jsx       # Router setup
```
