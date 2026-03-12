/**
 * store/entityStore.ts — Multi-Entity Architecture Core (v2)
 *
 * Added in v2:
 *   - selectedRoles: the raw roles the user ticked during setup
 *   - homeVariant: computed key that drives the home screen config
 *   - activeContext: which side of a dual-role screen is shown
 *   - resolveHomeVariant(): pure function, no API calls
 *   - setActiveContext(): persisted to AsyncStorage
 *
 * HOW IT ALL FITS:
 *   role-select.tsx  →  saves selectedRoles to store
 *   quick-setup.tsx  →  calls finishSetup() which resolves homeVariant
 *   /(home)/index.tsx →  reads homeVariant + activeContext → renders correct UI
 */

import { getMe, getMyCompanies } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

// ─── Selected Role IDs (from role-select screen) ──────────────────────────────
export type SelectedRole = 'boat_owner' | 'company_owner' | 'manager_company' | 'manager_boat'

// ─── Home Variant Keys ────────────────────────────────────────────────────────
export type HomeVariant =
  | 'BOAT_OWNER'               // boat_owner only
  | 'COMPANY_OWNER'            // company_owner only
  | 'BOAT_AND_COMPANY'         // boat_owner + company_owner
  | 'BOAT_AND_COMPANY_MANAGER' // boat_owner + manager_company
  | 'BOAT_AND_BOAT_MANAGER'    // boat_owner + manager_boat
  | 'MANAGER_ONLY'             // manager_company and/or manager_boat, no ownership

// ─── Active Context (for dual-role variants) ──────────────────────────────────
// 'primary' = the main/first entity, 'secondary' = the second entity
export type ActiveContext = 'primary' | 'secondary'

// ─── Entity Types ─────────────────────────────────────────────────────────────
export type EntityType =
  | 'BOAT_BUNDLE'
  | 'COMPANY'
  | 'MANAGER_COMPANY'
  | 'MANAGER_BOAT'
  | 'COMBINED'

export type EntityRole = 'owner' | 'manager'

export interface Entity {
  id: string
  type: EntityType
  label: string
  sublabel: string
  accent: string
  role: EntityRole
  permissions: string[]
  boatCount?: number
  companyName?: string
  companyId?: string
  boatName?: string
  boatId?: string
  ownerName?: string
}

export const ENTITY_ACCENTS: Record<EntityType, string> = {
  BOAT_BUNDLE:     '#1B7FBF',
  COMPANY:         '#059669',
  MANAGER_COMPANY: '#0891b2',
  MANAGER_BOAT:    '#d97706',
  COMBINED:        '#7c3aed',
}

export const ENTITY_EMOJIS: Record<EntityType, string> = {
  BOAT_BUNDLE:     '🚢',
  COMPANY:         '🏢',
  MANAGER_COMPANY: '👔',
  MANAGER_BOAT:    '⚓',
  COMBINED:        '📊',
}

// ─── Resolve Home Variant (pure function) ─────────────────────────────────────
export function resolveHomeVariant(roles: SelectedRole[]): HomeVariant {
  const has = (r: SelectedRole) => roles.includes(r)
  const hasBoat    = has('boat_owner')
  const hasCompany = has('company_owner')
  const hasMgrCo   = has('manager_company')
  const hasMgrBoat = has('manager_boat')

  if (hasBoat && hasCompany)  return 'BOAT_AND_COMPANY'
  if (hasBoat && hasMgrCo)    return 'BOAT_AND_COMPANY_MANAGER'
  if (hasBoat && hasMgrBoat)  return 'BOAT_AND_BOAT_MANAGER'
  if (hasBoat)                return 'BOAT_OWNER'
  if (hasCompany)             return 'COMPANY_OWNER'
  // manager only (one or both manager types)
  return 'MANAGER_ONLY'
}

// ─── Permissions helpers ──────────────────────────────────────────────────────
export function hasPerm(entity: Entity | null, perm: string): boolean {
  if (!entity) return false
  if (entity.role === 'owner') return true // owners have all perms
  return entity.permissions.includes(perm)
}

// ─── Store Interface ──────────────────────────────────────────────────────────
interface EntityState {
  // Setup output
  selectedRoles: SelectedRole[]
  homeVariant: HomeVariant | null

  // Entity list
  entities: Entity[]
  activeEntity: Entity | null        // primary entity (drives home screen)
  secondaryEntity: Entity | null     // secondary entity (for dual-role variants)

  // Context switcher state (persisted)
  activeContext: ActiveContext

  // Loading
  isLoaded: boolean
  isLoading: boolean
  loadError: string | null

  // Actions
  setSelectedRoles: (roles: SelectedRole[]) => void
  finishSetup: (params: {
    roles: SelectedRole[]
    companyName?: string
    boatName?: string
  }) => void
  loadEntities: (token: string) => Promise<void>
  setActiveEntity: (entity: Entity) => void
  setActiveContext: (ctx: ActiveContext) => void
  clearEntities: () => void
}

const ENTITY_STORAGE_KEY   = 'fishness_active_entity'
const CONTEXT_STORAGE_KEY  = 'fishness_active_context'
const ROLES_STORAGE_KEY    = 'fishness_selected_roles'

// ─── Store ────────────────────────────────────────────────────────────────────
export const useEntityStore = create<EntityState>((set, get) => ({
  selectedRoles: [],
  homeVariant: null,
  entities: [],
  activeEntity: null,
  secondaryEntity: null,
  activeContext: 'primary',
  isLoaded: false,
  isLoading: false,
  loadError: null,

  // ── Called from role-select.tsx when user ticks roles ─────────────────────
  setSelectedRoles: (roles: SelectedRole[]) => {
    set({ selectedRoles: roles, homeVariant: resolveHomeVariant(roles) })
    AsyncStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles)).catch(() => {})
  },

  // ── Called from quick-setup.tsx after API call succeeds ───────────────────
  // Builds local entities immediately so the home screen can render
  // without waiting for a full loadEntities() round-trip.
  finishSetup: ({ roles, companyName, boatName }) => {
    const variant = resolveHomeVariant(roles)
    const entities: Entity[] = []

    const hasBoat    = roles.includes('boat_owner')
    const hasCompany = roles.includes('company_owner')
    const hasMgrCo   = roles.includes('manager_company')
    const hasMgrBoat = roles.includes('manager_boat')

    if (hasBoat) {
      entities.push({
        id: 'personal_boats',
        type: 'BOAT_BUNDLE',
        label: boatName || 'My Boats',
        sublabel: 'Personal fleet · Owner',
        accent: ENTITY_ACCENTS.BOAT_BUNDLE,
        role: 'owner',
        permissions: [],
        boatName,
      })
    }

    if (hasCompany) {
      entities.push({
        id: 'my_company',
        type: 'COMPANY',
        label: companyName || 'My Company',
        sublabel: 'Your company · Owner',
        accent: ENTITY_ACCENTS.COMPANY,
        role: 'owner',
        permissions: [],
        companyName,
      })
    }

    if (hasMgrCo) {
      entities.push({
        id: 'manager_company_pending',
        type: 'MANAGER_COMPANY',
        label: 'Company (Manager)',
        sublabel: 'Waiting for owner to connect',
        accent: ENTITY_ACCENTS.MANAGER_COMPANY,
        role: 'manager',
        permissions: [],
      })
    }

    if (hasMgrBoat) {
      entities.push({
        id: 'manager_boat_pending',
        type: 'MANAGER_BOAT',
        label: 'Boat (Manager)',
        sublabel: 'Waiting for owner to connect',
        accent: ENTITY_ACCENTS.MANAGER_BOAT,
        role: 'manager',
        permissions: [],
      })
    }

    // Primary entity: owner entities come first, then manager
    const primary   = entities[0] ?? null
    const secondary = entities[1] ?? null

    set({
      selectedRoles: roles,
      homeVariant: variant,
      entities,
      activeEntity: primary,
      secondaryEntity: secondary,
      activeContext: 'primary',
      isLoaded: true,
    })

    if (primary) AsyncStorage.setItem(ENTITY_STORAGE_KEY, primary.id).catch(() => {})
    AsyncStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles)).catch(() => {})
  },

  // ── Full backend load (called on cold start for returning users) ───────────
  loadEntities: async (token: string) => {
    set({ isLoading: true, loadError: null })

    try {
      const [companiesRes, meRes] = await Promise.all([
        getMyCompanies(token),
        getMe(token),
      ])

      const ownedCompanies   = companiesRes.owned    ?? []
      const memberCompanies  = companiesRes.memberOf ?? []

      // Personal boats: read from meRes.ownedBoats when backend supports it
      const ownedBoats: Array<{ id: string; name: string }> =
        (meRes as any).ownedBoats ?? []

      const entities: Entity[] = []

      // Owned companies
      for (const co of ownedCompanies) {
        entities.push({
          id: co.id,
          type: 'COMPANY',
          label: co.name,
          sublabel: 'Your company · Owner',
          accent: ENTITY_ACCENTS.COMPANY,
          role: 'owner',
          permissions: [],
          companyId: co.id,
          companyName: co.name,
        })
      }

      // Personal boats bundle
      if (ownedBoats.length > 0) {
        entities.push({
          id: 'personal_boats',
          type: 'BOAT_BUNDLE',
          label: 'My Boats',
          sublabel: `${ownedBoats.length} boat${ownedBoats.length > 1 ? 's' : ''} · Personal`,
          accent: ENTITY_ACCENTS.BOAT_BUNDLE,
          role: 'owner',
          permissions: [],
          boatCount: ownedBoats.length,
        })
      }

      // Manager company contexts
      for (const co of memberCompanies) {
        const ws = meRes.workspaces?.find(w => w.id === co.id && w.role === 'manager')
        entities.push({
          id: `manager_co_${co.id}`,
          type: 'MANAGER_COMPANY',
          label: co.name,
          sublabel: 'Manager access',
          accent: ENTITY_ACCENTS.MANAGER_COMPANY,
          role: 'manager',
          permissions: ws?.permissions ?? [],
          companyId: co.id,
          companyName: co.name,
        })
      }

      // Manager boat contexts
      const managedBoats: Array<{ id: string; name: string; ownerName?: string }> =
        (meRes as any).managedBoats ?? []
      for (const boat of managedBoats) {
        const ws = meRes.workspaces?.find(w => w.id === boat.id && w.role === 'manager')
        entities.push({
          id: `manager_boat_${boat.id}`,
          type: 'MANAGER_BOAT',
          label: boat.name,
          sublabel: boat.ownerName ? `Managed for ${boat.ownerName}` : 'Manager access',
          accent: ENTITY_ACCENTS.MANAGER_BOAT,
          role: 'manager',
          permissions: ws?.permissions ?? [],
          boatId: boat.id,
          boatName: boat.name,
          ownerName: boat.ownerName,
        })
      }

      // Fallback — workspace-based
      if (entities.length === 0 && meRes.workspaces?.length > 0) {
        const ws = meRes.workspaces[0]
        entities.push({
          id: ws.id,
          type: ws.role === 'manager' ? 'MANAGER_COMPANY' : 'COMPANY',
          label: ws.name,
          sublabel: ws.role === 'manager' ? 'Manager access' : 'Your company · Owner',
          accent: ws.role === 'manager' ? ENTITY_ACCENTS.MANAGER_COMPANY : ENTITY_ACCENTS.COMPANY,
          role: ws.role as EntityRole,
          permissions: ws.permissions ?? [],
          companyId: ws.id,
          companyName: ws.name,
        })
      }

      // Reconstruct selectedRoles and homeVariant from entities
      const rolesFromStorage = await AsyncStorage.getItem(ROLES_STORAGE_KEY)
      const storedRoles: SelectedRole[] = rolesFromStorage ? JSON.parse(rolesFromStorage) : []

      // Derive roles from entities if storage is empty
      const derivedRoles: SelectedRole[] = storedRoles.length > 0 ? storedRoles : (() => {
        const r: SelectedRole[] = []
        if (entities.some(e => e.type === 'BOAT_BUNDLE'))     r.push('boat_owner')
        if (entities.some(e => e.type === 'COMPANY'))         r.push('company_owner')
        if (entities.some(e => e.type === 'MANAGER_COMPANY')) r.push('manager_company')
        if (entities.some(e => e.type === 'MANAGER_BOAT'))    r.push('manager_boat')
        return r
      })()

      const variant = resolveHomeVariant(derivedRoles)

      // Restore active entity from storage
      const savedId   = await AsyncStorage.getItem(ENTITY_STORAGE_KEY)
      const savedCtx  = (await AsyncStorage.getItem(CONTEXT_STORAGE_KEY)) as ActiveContext | null

      const primary   = entities[0] ?? null
      const secondary = entities[1] ?? null
      const active    = (savedId ? entities.find(e => e.id === savedId) : null) ?? primary

      set({
        entities,
        activeEntity: active,
        secondaryEntity: secondary,
        selectedRoles: derivedRoles,
        homeVariant: variant,
        activeContext: savedCtx ?? 'primary',
        isLoaded: true,
        isLoading: false,
        loadError: null,
      })
    } catch (err: any) {
      set({ isLoading: false, loadError: err?.message ?? 'Failed to load workspace' })
    }
  },

  setActiveEntity: (entity: Entity) => {
    set({ activeEntity: entity })
    AsyncStorage.setItem(ENTITY_STORAGE_KEY, entity.id).catch(() => {})
  },

  setActiveContext: (ctx: ActiveContext) => {
    set({ activeContext: ctx })
    AsyncStorage.setItem(CONTEXT_STORAGE_KEY, ctx).catch(() => {})
  },

  clearEntities: () => {
    set({
      entities: [], activeEntity: null, secondaryEntity: null,
      selectedRoles: [], homeVariant: null, activeContext: 'primary',
      isLoaded: false, loadError: null,
    })
    AsyncStorage.multiRemove([ENTITY_STORAGE_KEY, CONTEXT_STORAGE_KEY, ROLES_STORAGE_KEY]).catch(() => {})
  },
}))