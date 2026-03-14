/**
 * store/themeStore.ts
 *
 * Global theme state — Zustand store.
 * Exposes useTheme() so ANY screen gets reactive theme in one line:
 *
 *   const theme = useTheme()   ← replaces static import { theme }
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance } from 'react-native'
import { create } from 'zustand'
import { ColorMode, darkTheme, lightTheme, setThemeMode } from '../constants/theme'

const THEME_KEY = 'fishness_theme_mode'

interface ThemeState {
  mode: ColorMode
  isInitialised: boolean
  initTheme: () => Promise<void>
  setMode: (mode: ColorMode) => Promise<void>
}

const initialMode: ColorMode = Appearance.getColorScheme() === 'light' ? 'light' : 'dark'

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  isInitialised: false,

  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY)
      const mode: ColorMode = saved === 'light' || saved === 'dark' ? saved : initialMode
      setThemeMode(mode)
      set({ mode, isInitialised: true })
    } catch {
      setThemeMode(initialMode)
      set({ mode: initialMode, isInitialised: true })
    }
  },

  setMode: async (mode) => {
    setThemeMode(mode)
    set({ mode })
    await AsyncStorage.setItem(THEME_KEY, mode)
  },
}))

/**
 * useTheme()
 *
 * Drop-in replacement for `import { theme } from '../constants/theme'`
 * Returns the live theme object — re-renders the screen when mode changes.
 *
 * Use inside any screen or component:
 *   const theme = useTheme()
 */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode)
  return mode === 'dark' ? darkTheme : lightTheme
}