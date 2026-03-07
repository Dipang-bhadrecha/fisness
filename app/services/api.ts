/**
 * ═══════════════════════════════════════════════════════
 * services/api.ts — Fishness API Client
 * ═══════════════════════════════════════════════════════
 *
 * Single source of truth for all backend calls.
 * Never call fetch() directly from a screen — always go through here.
 *
 * Base URL comes from EXPO_PUBLIC_API_URL in .env.local
 * On Android physical device: must be your laptop's LAN IP, e.g.
 *   http://192.168.1.42:3000
 * NOT localhost (localhost on the phone = the phone itself).
 */

// ─── Base config ──────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string
  phone: string
  name: string | null
  createdAt: string
}

export interface AuthVerifyResponse {
  token: string
  user: ApiUser
  isNewUser: boolean
}

export interface WorkspaceSetupPayload {
  // Role selected in wizard
  primaryRole: 'owner' | 'manager' | 'both'

  // Owner path fields (present if role is owner or both)
  ownerType?: 'company' | 'personal' | 'both'
  companyName?: string
  firstBoatName?: string
  boatRegistration?: string

  // Manager path fields (present if role is manager or both)
  ownerPhone?: string
}

export interface Workspace {
  id: string
  type: 'company' | 'personal' | 'manager_access'
  name: string
  role: 'owner' | 'manager'
  permissions: string[]
}

export interface MeResponse {
  user: ApiUser
  workspaces: Workspace[]
  hasCompletedSetup: boolean
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    })
  } catch (err) {
    // Network error — server unreachable
    throw new ApiError(
      `Cannot reach server at ${BASE_URL}. Check your IP in .env.local and ensure both devices are on the same WiFi.`,
      0,
      'NETWORK_ERROR'
    )
  }

  // Parse body regardless of status (Fastify always sends JSON)
  let body: any
  try {
    body = await response.json()
  } catch {
    body = {}
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.code
    )
  }

  return body as T
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

/**
 * Step 1 of login: Send OTP to phone via Twilio
 * POST /auth/send-otp
 */
export async function sendOtp(phone: string): Promise<{ message: string }> {
  return request('/api/v1/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

/**
 * Step 2 of login: Verify the OTP code
 * POST /auth/verify-otp
 * Returns token + user. isNewUser = true if first time login.
 */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<AuthVerifyResponse> {
  return request('/api/v1/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

// ─── Setup endpoint ───────────────────────────────────────────────────────────

/**
 * Save workspace configuration from the setup wizard
 * POST /auth/setup
 * Called once from setup/done.tsx after wizard is complete.
 */
export async function completeSetup(
  token: string,
  payload: WorkspaceSetupPayload
): Promise<{ workspaces: Workspace[] }> {
  return request('/auth/setup', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

// ─── User endpoints ───────────────────────────────────────────────────────────

/**
 * Get current user profile + all workspaces
 * GET /me
 */
export async function getMe(token: string): Promise<MeResponse> {
  return request('/me', {
    method: 'GET',
    token,
  })
}