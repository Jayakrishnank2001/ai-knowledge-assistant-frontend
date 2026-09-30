/**
 * Tiny typed REST client for the NestJS backend.
 *
 * Every request goes to API_BASE_URL and automatically attaches the Bearer
 * token that was saved after login. The base URL comes from
 * NEXT_PUBLIC_API_BASE_URL (.env) - the deployed Railway backend by default,
 * or http://localhost:3001/api when developing locally.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api'
).replace(/\/+$/, '')

const TOKEN_KEY = 'nexa_ai_token'
const USER_KEY = 'nexa_ai_user'

// ---------------------------------------------------------------------------
// API types (mirror the DTOs returned by the NestJS backend)
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string
  email: string
  name: string
  workspaceName?: string
}

export interface SourceRef {
  name: string
  page: number
  relevance?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: SourceRef[]
}

export interface ConversationSummary {
  id: string
  title: string
  preview: string
  date: string
  messageCount: number
}

export interface ConversationDetail {
  id: string
  title: string
  preview: string
  date: string
  messages: ChatMessage[]
}

export type DocumentStatus = 'processing' | 'completed' | 'failed'

export interface DocumentRecord {
  id: string
  fileName: string
  fileSize: string
  fileSizeBytes: number
  status: DocumentStatus
  uploadedAt: string
  pageCount: number
}

export interface OverviewStats {
  documents: number
  pages: number
  processedPercent: number
  conversations: number
  questionsAnswered: number
}

export interface RecentDocument {
  id: string
  name: string
  pages: number
  daysAgo: number
  status: DocumentStatus
}

export interface AiPreferences {
  chatModel: string
  availableModels: string[]
}

export interface SignupStartResponse {
  success: boolean
  message: string
  /** Only present in local dev (SMTP unconfigured) - the code for testing. */
  devOtp?: string
}

// ---------------------------------------------------------------------------
// Session helpers (persist the token across page reloads)
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message)
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** Refresh the cached user (e.g. after a profile update) without touching the token. */
export function saveUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ---------------------------------------------------------------------------
// The fetch helper + every endpoint exposed by the backend
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: string
  body?: BodyInit | null
}

/**
 * Performs the request and turns any non-2xx response into an ApiError.
 * Callers decide how to read the body (JSON or binary).
 */
async function send(path: string, options: RequestOptions = {}): Promise<Response> {
  const headers = new Headers()
  // multipart bodies (FormData) set their own content-type + boundary
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      body: options.body ?? undefined,
      headers,
    })
  } catch {
    throw new ApiError('Cannot reach the API server. Is the NestJS backend running?', 0)
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      const text = typeof body === 'object' && body !== null ? body.message : null
      if (text) message = Array.isArray(text) ? text.join(' · ') : String(text)
    } catch {
      // error body was not JSON - keep the generic message
    }
    throw new ApiError(message, response.status)
  }

  return response
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  return response.json() as Promise<T>
}

/** Like `request`, but for binary payloads (PDF previews / downloads). */
async function requestBlob(path: string): Promise<Blob> {
  const response = await send(path)
  return response.blob()
}

export const api = {
  // -- auth --------------------------------------------------------------
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  /** OTP signup, step 1: sends a 6-digit code to the email (resend = call again). */
  signupStart: (email: string, password: string) =>
    request<SignupStartResponse>('/auth/signup/start', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** OTP signup, step 2: verifies the code, saves the user and starts a session. */
  signupVerify: (email: string, otp: string) =>
    request<{ token: string; user: AuthUser }>('/auth/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  me: () => request<AuthUser>('/auth/me'),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  updateProfile: (patch: { name?: string; email?: string; workspaceName?: string }) =>
    request<AuthUser>('/auth/me', { method: 'PATCH', body: JSON.stringify(patch) }),

  // -- documents -----------------------------------------------------------
  documents: () => request<DocumentRecord[]>('/documents'),

  getDocument: (id: string) =>
    request<DocumentRecord>(`/documents/${encodeURIComponent(id)}`),

  /** The original PDF as a Blob - powers the in-app preview and downloads. */
  documentFile: (id: string) =>
    requestBlob(`/documents/${encodeURIComponent(id)}/file`),

  uploadDocument: (file: File) => {
    const body = new FormData()
    body.append('file', file, file.name)
    return request<DocumentRecord>('/documents', { method: 'POST', body })
  },

  deleteDocument: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/documents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // -- conversations ---------------------------------------------------------
  conversations: () => request<ConversationSummary[]>('/conversations'),

  conversation: (id: string) =>
    request<ConversationDetail>(`/conversations/${encodeURIComponent(id)}`),

  createConversation: (title?: string) =>
    request<ConversationDetail>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  deleteConversation: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // -- chat ------------------------------------------------------------------
  ask: (question: string, conversationId?: string) =>
    request<ConversationDetail>('/chat', {
      method: 'POST',
      body: JSON.stringify({ question, conversationId }),
    }),

  messages: (conversationId: string) =>
    request<ChatMessage[]>(`/chat/${encodeURIComponent(conversationId)}/messages`),

  // -- overview -----------------------------------------------------------------
  stats: () => request<OverviewStats>('/overview/stats'),

  recentDocuments: () => request<RecentDocument[]>('/overview/recent-documents'),

  // -- settings ------------------------------------------------------------------
  /** Current AI preferences (Gemini chat model persisted in the backend .env). */
  getAiPreferences: () => request<AiPreferences>('/settings/ai'),

  /** Persist the selected chat model to the backend .env (applies immediately). */
  updateAiPreferences: (chatModel: string) =>
    request<AiPreferences>('/settings/ai', {
      method: 'PUT',
      body: JSON.stringify({ chatModel }),
    }),
}
// ---------------------------------------------------------------------------
// Small date helpers used by several pages
// ---------------------------------------------------------------------------

/** "Sep 19, 2:28 PM" style, used for lists. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "2:28 PM" style, used for chat bubbles. */
export function formatClock(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}