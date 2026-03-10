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

const BASE_URL = 'http://13.235.52.23:3001'

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

  // Backend wraps success responses as { success, message, data, timestamp }
  const payload = body?.data !== undefined ? body.data : body
  return payload as T
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
  const data = await request<{ token: string; user: { id: string; phone: string; name: string | null; isNewUser: boolean } }>(
    '/api/v1/auth/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }
  )
  return {
    token: data.token,
    user: {
      id: data.user.id,
      phone: data.user.phone,
      name: data.user.name,
      createdAt: new Date().toISOString(),
    },
    isNewUser: data.user.isNewUser,
  }
}

// ─── Setup endpoint ───────────────────────────────────────────────────────────

/**
 * Save workspace configuration from the setup wizard
 * POST /api/v1/auth/setup
 * Called once from setup/done.tsx after wizard is complete.
 */
export async function completeSetup(
  token: string,
  payload: WorkspaceSetupPayload
): Promise<{ workspaces: Workspace[] }> {
  return request('/api/v1/auth/setup', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

// ─── User endpoints ───────────────────────────────────────────────────────────

/** Backend /me returns user with ownedCompanies, companyMemberships, etc. */
interface BackendMeUser {
  id: string
  phone: string
  name: string | null
  createdAt: string
  ownedCompanies?: Array<{ id: string; name: string }>
  companyMemberships?: Array<{ company: { id: string; name: string } }>
}

/**
 * Get current user profile + all workspaces
 * GET /api/v1/auth/me
 */
export async function getMe(token: string): Promise<MeResponse> {
  const user = await request<BackendMeUser>('/api/v1/auth/me', {
    method: 'GET',
    token,
  })
  const workspaces: Workspace[] = []
  if (user.ownedCompanies) {
    for (const c of user.ownedCompanies) {
      workspaces.push({ id: c.id, type: 'company', name: c.name, role: 'owner', permissions: [] })
    }
  }
  if (user.companyMemberships) {
    for (const m of user.companyMemberships) {
      workspaces.push({
        id: m.company.id,
        type: 'manager_access',
        name: m.company.name,
        role: 'manager',
        permissions: [],
      })
    }
  }
  return {
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
    },
    workspaces,
    hasCompletedSetup: workspaces.length > 0,
  }
}

// ─── Company endpoints ────────────────────────────────────────────────────────

export interface ApiCompany {
  id: string
  name: string
  nameGujarati?: string | null
  phone?: string | null
  address?: string | null
  gstNumber?: string | null
}

export interface CompaniesResponse {
  owned: ApiCompany[]
  memberOf: ApiCompany[]
}

export async function getMyCompanies(token: string): Promise<CompaniesResponse> {
  return request('/api/v1/companies', { method: 'GET', token })
}

export interface ApiRegisteredBoat {
  id: string
  name: string
  nameGujarati?: string | null
  ownerName?: string | null
  ownerPhone?: string | null
}

export async function getRegisteredBoats(
  token: string,
  companyId: string
): Promise<ApiRegisteredBoat[]> {
  return request(`/api/v1/companies/${companyId}/registered-boats`, {
    method: 'GET',
    token,
  })
}

// ─── Session (Tali) endpoints ───────────────────────────────────────────────────

export interface CreateSessionPayload {
  companyId: string
  registeredBoatId: string
  clientId?: string
  notes?: string
}

export interface ApiSession {
  id: string
  companyId: string
  registeredBoatId: string
  status: string
  startTime: string
  endTime?: string | null
  clientId?: string | null
  company?: { id: string; name: string }
  registeredBoat?: { id: string; name: string }
}

export async function createSession(
  token: string,
  payload: CreateSessionPayload
): Promise<ApiSession> {
  return request('/api/v1/sessions', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export interface FishEntryPayload {
  fishId: string
  fishName: string
  fishNameGujarati?: string
  bucketWeight: number
  totalKg: number
}

export async function endSession(
  token: string,
  sessionId: string,
  fishEntries: FishEntryPayload[]
): Promise<unknown> {
  return request(`/api/v1/sessions/${sessionId}/end`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ fishEntries }),
  })
}

export async function syncSession(
  token: string,
  sessionId: string,
  data: {
    fishEntries: FishEntryPayload[]
    endTime?: string
    notes?: string
  }
): Promise<unknown> {
  return request(`/api/v1/sessions/${sessionId}/sync`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}
