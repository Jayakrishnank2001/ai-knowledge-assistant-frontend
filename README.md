# AI Knowledge Assistant — Frontend (Next.js)

The web UI for the AI Knowledge Assistant: a document-aware chat over your
company knowledge base. Built with [Next.js](https://nextjs.org/) 16 (App
Router) + React 19, talking to the NestJS API in
[`../ai-knowledge-assistant-backend`](../ai-knowledge-assistant-backend)
(read that README first — the backend must be running).

## Features

- **Overview** — per-user dashboard: document/page/conversation counters,
  recent documents, frequently-asked-question shortcuts that open Chat and
  auto-send the question (`/chat?question=...`).
- **Documents** — upload PDFs (modal), status polling while they index,
  in-app PDF preview (click a card), delete with a confirm modal.
- **Chat** — RAG answers rendered with `react-markdown`, per-page source cards
  with relevance scores, continue any conversation (`/chat?conversation=ID`).
- **Conversations** — list, open, and delete your own threads.
- **Settings** — profile editing + AI Preferences: pick the Gemini chat model;
  the choice is persisted to the backend `.env` and applies immediately.
- **Auth** — sign in / sign up with email OTP on one page (`signin → signup →
  otp` views), session persisted in `localStorage`, stale tokens auto-logout.
- **Responsive** — sidebar collapses to a hamburger drawer on small screens
  (navigation + logout).

## Tech stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 16 (App Router) + React 19                 |
| Language       | TypeScript                                          |
| Client routing | react-router-dom (routes rendered inside `AppClient`) |
| Styling        | Tailwind CSS v4 (`app/globals.css`) + shadcn-style `components/ui` (cva) |
| Icons          | lucide-react                                       |
| Chat rendering | react-markdown                                     |
| API client     | `lib/api.ts` (typed fetch wrapper, auto Bearer token) |

## Getting started

```bash
npm install                    # or: pnpm install (package.json declares pnpm)

cp .env.example .env.local     # point NEXT_PUBLIC_API_BASE_URL at the backend
npm run dev                    # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

### Environment variables

| Variable                   | Purpose                            | Default                 |
| -------------------------- | ---------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL used by `lib/api.ts` | `https://ai-knowledge-assistant-backend-production.up.railway.app/api` (local: `http://localhost:3001/api`) |

**Deployed URLs:** frontend `https://ai-knowledge-assistant-liart-theta.vercel.app`
· backend `https://ai-knowledge-assistant-backend-production.up.railway.app/api`.

> `NEXT_PUBLIC_*` values are **baked in at build time** — change them in
> `.env.local` and restart the dev server (or rebuild) for changes to take
> effect. `.env` values are gitignored; `.env.example` only holds placeholders.

## Routes

| Path             | Component           | Notes                                         |
| ---------------- | ------------------- | --------------------------------------------- |
| `/` `/overview`  | `OverviewPage`      | Dashboard                                     |
| `/documents`     | `DocumentsPage`     | Upload / preview / delete                     |
| `/chat`          | `ChatPage`          | Also honours `?conversation=` and `?question=` |
| `/conversations` | `ConversationsPage` | List + delete                                 |
| `/settings`      | `SettingsPage`      | Profile / AI Preferences tabs                 |

Anything else redirects to `/`. Until a session exists, `LoginPage` is shown
instead of the shell.

## Project structure

```
app/                      # Next.js shell: layout.tsx, page.tsx -> <AppClient/>, globals.css
components/
  AppClient.tsx           # auth gate + <BrowserRouter> routes + sidebar/hamburger shell
  Sidebar.tsx             # nav + user card + logout (drawer variant on small screens)
  Header.tsx              # page header (title, actions)
  LoginPage.tsx           # signin -> signup -> otp views
  OverviewPage.tsx        # dashboard
  DocumentsPage.tsx       # document list + upload/poll/delete
  DocumentCard.tsx        # list row (click = preview, hover = eye icon)
  ChatPage.tsx            # chat UI + ?question=/?conversation= handling
  ChatMessage.tsx         # markdown bubble + source cards + copy
  ConversationsPage.tsx   # conversation list
  ConversationItem.tsx    # list row + delete
  SettingsPage.tsx        # Profile / AI Preferences tabs
  Modal.tsx               # shared dialog shell (backdrop, header, Escape)
  ConfirmModal.tsx        # destructive-action confirm (built on Modal)
  UploadModal.tsx         # PDF upload (built on Modal)
  DocumentPreviewModal.tsx# in-app PDF viewer (built on Modal)
  ui/button.tsx           # shadcn-style cva button
lib/
  api.ts                  # typed REST client: request/requestBlob, endpoints, session helpers
  ui.ts                   # useEscapeKey, errorText, useDeleteConfirm
  utils.ts                # cn() class merger
```

## Key behaviours worth knowing

- **Auth**: `lib/api.ts` attaches `Authorization: Bearer <token>` to every
  request; a `401` anywhere clears the session and drops you back on the login
  screen. The token is validated against `GET /auth/me` on page load.
- **PDF preview**: the file endpoint needs the token, and an `<iframe>` can't
  send headers — so the PDF is fetched as a Blob and rendered from a temporary
  object URL (revoked when the modal closes).
- **Processing documents**: the list polls every few seconds while any
  document is `processing`.
- **Delete flows** all go through the shared `ConfirmModal` (conversations and
  documents); native `confirm()` is not used anywhere.

## Troubleshooting

**"Failed to fetch" / network errors on every page**: the backend isn't
running (start it with `npm run start:dev` in `ai-knowledge-assistant-backend`,
default port 3001) or `NEXT_PUBLIC_API_BASE_URL` points somewhere else.

**Everything returns 401 and you're logged out immediately**: your JWT
expired (7-day default) or was revoked by a logout elsewhere — sign in again.

**Changes to `.env.local` don't apply**: `NEXT_PUBLIC_*` vars are inlined at
build/restart time — restart the dev server.

**Port 3000 already in use**: `npx next dev -p 3002` (also add that origin to
the backend's `CORS_ORIGINS` in its `.env`).

## Scripts

| Command            | What it does                       |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Dev server with hot reload (:3000) |
| `npm run build`    | Production build                   |
| `npm start`        | Serve the production build         |
| `npx tsc --noEmit` | Type-check without emitting        |