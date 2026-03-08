/**
 * Auth state: token, user, and setup completion.
 * Persisted to AsyncStorage so the session survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import type { ApiUser, Workspace } from '@/services/api'

const AUTH_KEY = 'fishness_auth'
const SETUP_KEY = 'fishness_setup_complete'

interface AuthState {
  token: string | null
  user: ApiUser | null
  hasCompletedSetup: boolean
  isInitialised: boolean

  setAuth: (token: string, user: ApiUser, isNewUser: boolean) => Promise<void>
  setSetupComplete: (workspaces: Workspace[]) => Promise<void>
  logout: () => Promise<void>
  restoreFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hasCompletedSetup: false,
  isInitialised: false,

  setAuth: async (token, user, isNewUser) => {
    set({
      token,
      user,
      hasCompletedSetup: !isNewUser,
    })
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }))
    await AsyncStorage.setItem(SETUP_KEY, (!isNewUser).toString())
  },

  setSetupComplete: async (workspaces) => {
    set({ hasCompletedSetup: true })
    await AsyncStorage.setItem(SETUP_KEY, 'true')
  },

  logout: async () => {
    set({ token: null, user: null, hasCompletedSetup: false })
    await AsyncStorage.multiRemove([AUTH_KEY, SETUP_KEY])
  },

  restoreFromStorage: async () => {
    try {
      const [authJson, setupDone] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(SETUP_KEY),
      ])
      if (authJson) {
        const { token, user } = JSON.parse(authJson) as {
          token: string
          user: ApiUser
        }
        set({
          token,
          user,
          hasCompletedSetup: setupDone === 'true',
        })
      } else {
        set({ hasCompletedSetup: setupDone === 'true' })
      }
    } catch (_) {
      // Ignore parse errors
    } finally {
      set({ isInitialised: true })
    }
  },
}))
