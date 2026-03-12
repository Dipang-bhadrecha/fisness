/**
 * store/entityStore.ts — Multi-Entity Architecture Core
 *
 * This is the single most important file in the entire app architecture.
 * It determines:
 *   - Which entities (boats / companies / manager contexts) this user has
 *   - Which entity is currently active
 *   - What permissions apply in the current context
 *
 * Built directly from your backend's getMe() and getMyCompanies() responses.
 *
 * Entity types map to dashboard routes:
 *   BOAT_BUNDLE      → /(boat)/home      (Rohan: 5 personal boats)
 *   COMPANY          → /(company)/home   (Suresh: owns ABC Fisheries)
 *   MANAGER_COMPANY  → /(manager)/home   (Vanraj: manages for Suresh)
 *   COMBINED         → /(combined)/home  (Damodar: company + personal boats)
 */

import { getMe, getMyCompanies } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EntityType =
  | 'BOAT_BUNDLE'       // personal boats (no company)
  | 'COMPANY'           // owns a fishing company
  | 'MANAGER_COMPANY'   // manages someone else's company
  | 'COMBINED'          // company + personal boats together

export type EntityRole = 'owner' | 'manager'

export interface Entity {
  id: string              // companyId, 'personal_boats', or 'combined'
  type: EntityType
  label: string           // e.g. "ABC Fisheries" or "My Boats (5)"
  sublabel: string        // e.g. "Mangrol · Owner" or "5 boats"
  accent: string          // hex color — blue/green/purple/teal
  role: EntityRole
  permissions: string[]   // empty for owners, permission list for managers
  // Extra context
  boatCount?: number
  companyName?: string
  companyId?: string
}

export const ENTITY_ACCENTS: Record<EntityType, string> = {
  BOAT_BUNDLE:     '#1B7FBF',   // ocean blue
  COMPANY:         '#059669',   // emerald green
  MANAGER_COMPANY: '#0891b2',   // teal
  COMBINED:        '#7c3aed',   // purple
}

export const ENTITY_EMOJIS: Record<EntityType, string> = {
  BOAT_BUNDLE:     '🚢',
  COMPANY:         '🏢',
  MANAGER_COMPANY: '👔',
  COMBINED:        '📊',
}

export const DASHBOARD_ROUTES: Record<EntityType, string> = {
  BOAT_BUNDLE:     '/(boat)/home',
  COMPANY:         '/(company)/home',
  MANAGER_COMPANY: '/(manager)/home',
  COMBINED:        '/(combined)/home',
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface EntityState {
  entities: Entity[]
  activeEntity: Entity | null
  isLoaded: boolean
  isLoading: boolean
  loadError: string | null

  loadEntities: (token: string) => Promise<void>
  setActiveEntity: (entity: Entity) => void
  clearEntities: () => void
}

const ENTITY_STORAGE_KEY = 'fishness_active_entity'

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  activeEntity: null,
  isLoaded: false,
  isLoading: false,
  loadError: null,

  /**
   * loadEntities — called once after login / on app cold start
   *
   * Reads the user's backend profile and constructs a rich entity list:
   *   1. Calls getMyCompanies() to get owned + memberOf companies
   *   2. Calls getMe() to get owned boats
   *   3. Builds entity objects based on what combination the user has
   *   4. Restores previously active entity from AsyncStorage if valid
   */
  loadEntities: async (token: string) => {
    set({ isLoading: true, loadError: null })

    try {
      // ── Fetch from backend ─────────────────────────────────────────────────
      const [companiesRes, meRes] = await Promise.all([
        getMyCompanies(token),
        getMe(token),
      ])

      const ownedCompanies = companiesRes.owned ?? []
      const memberOfCompanies = companiesRes.memberOf ?? []
      // Personal boats come from meRes.workspaces or a future /api/v1/boats endpoint
      // For now we derive boat count from meRes context
      const personalBoats: Array<{ id: string; name: string }> = []
      // TODO: replace with real boats API when /api/v1/boats is built
      // const personalBoats = await getPersonalBoats(token)

      // ── Build entity list ──────────────────────────────────────────────────
      const entities: Entity[] = []

      // 1. Owned companies
      for (const company of ownedCompanies) {
        entities.push({
          id: company.id,
          type: 'COMPANY',
          label: company.name,
          sublabel: `Your company · Owner`,
          accent: ENTITY_ACCENTS.COMPANY,
          role: 'owner',
          permissions: [],
          companyId: company.id,
          companyName: company.name,
        })
      }

      // 2. Manager contexts
      for (const company of memberOfCompanies) {
        // Extract permissions from meRes.workspaces
        const workspace = meRes.workspaces?.find(
          (w) => w.id === company.id && w.role === 'manager'
        )
        entities.push({
          id: `manager_${company.id}`,
          type: 'MANAGER_COMPANY',
          label: company.name,
          sublabel: `Manager access`,
          accent: ENTITY_ACCENTS.MANAGER_COMPANY,
          role: 'manager',
          permissions: workspace?.permissions ?? [],
          companyId: company.id,
          companyName: company.name,
        })
      }

      // 3. Personal boats bundle (if user has personal boats)
      if (personalBoats.length > 0) {
        entities.push({
          id: 'personal_boats',
          type: 'BOAT_BUNDLE',
          label: 'My Boats',
          sublabel: `${personalBoats.length} boat${personalBoats.length > 1 ? 's' : ''} · Personal`,
          accent: ENTITY_ACCENTS.BOAT_BUNDLE,
          role: 'owner',
          permissions: [],
          boatCount: personalBoats.length,
        })
      }

      // 4. Combined view — only if user has BOTH company AND personal boats
      if (ownedCompanies.length > 0 && personalBoats.length > 0) {
        entities.push({
          id: 'combined',
          type: 'COMBINED',
          label: 'Total Overview',
          sublabel: `${ownedCompanies.length} compan${ownedCompanies.length > 1 ? 'ies' : 'y'} + ${personalBoats.length} boats`,
          accent: ENTITY_ACCENTS.COMBINED,
          role: 'owner',
          permissions: [],
        })
      }

      // ── Fallback: if user has nothing yet (just signed up, wizard done) ────
      // Give them a default COMPANY entity using their first workspace
      if (entities.length === 0 && meRes.workspaces && meRes.workspaces.length > 0) {
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

      // ── Restore last active entity from storage ────────────────────────────
      let activeEntity: Entity | null = null
      try {
        const savedId = await AsyncStorage.getItem(ENTITY_STORAGE_KEY)
        if (savedId) {
          activeEntity = entities.find((e) => e.id === savedId) ?? null
        }
      } catch (_) { /* ignore */ }

      // If no saved entity or it no longer exists, default to first
      if (!activeEntity && entities.length > 0) {
        activeEntity = entities[0]
      }

      set({
        entities,
        activeEntity,
        isLoaded: true,
        isLoading: false,
        loadError: null,
      })
    } catch (err: any) {
      set({
        isLoading: false,
        loadError: err?.message ?? 'Failed to load your entities',
      })
    }
  },

  /**
   * setActiveEntity — switches the active context
   * Persists the selection to AsyncStorage for next cold start.
   */
  setActiveEntity: (entity: Entity) => {
    set({ activeEntity: entity })
    AsyncStorage.setItem(ENTITY_STORAGE_KEY, entity.id).catch(() => {})
  },

  /**
   * clearEntities — called on logout
   */
  clearEntities: () => {
    set({ entities: [], activeEntity: null, isLoaded: false, loadError: null })
    AsyncStorage.removeItem(ENTITY_STORAGE_KEY).catch(() => {})
  },
}))