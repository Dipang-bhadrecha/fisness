/**
 * ═══════════════════════════════════════════════════════
 * store/authStore.ts — Authentication State
 * ═══════════════════════════════════════════════════════
 *
 * Holds the JWT token, user object, and setup state.
 * Persisted to AsyncStorage so the user stays logged in.
 *
 * This store drives the entire post-auth routing decision:
 *   token === null      → show auth screens (phone/otp)
 *   hasCompletedSetup   → show dashboard
 *   !hasCompletedSetup  → show setup wizard
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { ApiUser, Workspace } from '../app/services/api'

const AUTH_STORAGE_KEY = 'fishness_auth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  // Core auth
  token: string | null
  user: ApiUser | null

  // Setup state
  hasCompletedSetup: boolean
  workspaces: Workspace[]

  // Loading flags
  isLoading: boolean        // true while restoring from AsyncStorage on app start
  isInitialised: boolean    // true once AsyncStorage restore attempt is done

  // Actions
  setAuth: (token: string, user: ApiUser, isNewUser: boolean) => Promise<void>
  setSetupComplete: (workspaces: Workspace[]) => Promise<void>
  updateUser: (user: ApiUser) => void
  updateWorkspaces: (workspaces: Workspace[]) => void
  logout: () => Promise<void>
  restoreFromStorage: () => Promise<void>
}

// ─── Persisted shape saved to AsyncStorage ────────────────────────────────────

interface PersistedAuth {
  token: string
  user: ApiUser
  hasCompletedSetup: boolean
  workspaces: Workspace[]
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hasCompletedSetup: false,
  workspaces: [],
  isLoading: true,
  isInitialised: false,

  /**
   * Called after successful OTP verification.
   * Saves token + user. If returning user (isNewUser=false), also marks setup complete.
   */
  setAuth: async (token, user, isNewUser) => {
    const hasCompletedSetup = !isNewUser

    set({ token, user, hasCompletedSetup, isLoading: false })

    const toStore: PersistedAuth = {
      token,
      user,
      hasCompletedSetup,
      workspaces: get().workspaces,
    }
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore))
  },

  /**
   * Called from setup/done.tsx after wizard completes.
   * Marks setup as done and saves workspaces.
   */
  setSetupComplete: async (workspaces) => {
    set({ hasCompletedSetup: true, workspaces })

    const current = get()
    const toStore: PersistedAuth = {
      token: current.token!,
      user: current.user!,
      hasCompletedSetup: true,
      workspaces,
    }
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore))
  },

  updateUser: (user) => set({ user }),

  updateWorkspaces: (workspaces) => set({ workspaces }),

  /**
   * Clears all auth state. Navigates user back to phone screen.
   */
  logout: async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
    set({
      token: null,
      user: null,
      hasCompletedSetup: false,
      workspaces: [],
    })
  },

  /**
   * Called once on app start from app/index.tsx.
   * Restores session from AsyncStorage so the user doesn't
   * have to log in again every time.
   */
  restoreFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
      if (raw) {
        const parsed: PersistedAuth = JSON.parse(raw)
        set({
          token: parsed.token,
          user: parsed.user,
          hasCompletedSetup: parsed.hasCompletedSetup ?? false,
          workspaces: parsed.workspaces ?? [],
        })
      }
    } catch (err) {
      // Corrupted storage — treat as logged out
      console.warn('[authStore] Failed to restore session:', err)
    } finally {
      set({ isLoading: false, isInitialised: true })
    }
  },
}))