import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance } from 'react-native'
import { create } from 'zustand'
import { ColorMode, setThemeMode } from '../constants/theme'

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
      Appearance.setColorScheme(mode)
      setThemeMode(mode)
      set({ mode, isInitialised: true })
    } catch {
      Appearance.setColorScheme(initialMode)
      setThemeMode(initialMode)
      set({ mode: initialMode, isInitialised: true })
    }
  },

  setMode: async (mode) => {
    Appearance.setColorScheme(mode)
    setThemeMode(mode)
    set({ mode })
    await AsyncStorage.setItem(THEME_KEY, mode)
  },
}))
