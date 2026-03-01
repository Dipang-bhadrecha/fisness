import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { darkColors, designTokens, lightColors } from '../constants/designTokens'
import { useAsyncStorage } from './useAsyncStorage'

const THEME_STORAGE_KEY = 'app_color_mode'

type ColorMode = 'dark' | 'light'

interface Theme {
  mode: ColorMode
  colors: Record<string, any>
  typography: typeof designTokens.typography
  spacing: typeof designTokens.spacing
  borderRadius: typeof designTokens.borderRadius
  shadows: typeof designTokens.shadows
  accessibility: typeof designTokens.accessibility
  componentTokens: typeof designTokens.componentTokens
  motion: typeof designTokens.motion
}

/**
 * useAppTheme — Get current theme and toggle function
 * @returns { theme, colorMode, toggleTheme, isInitialized }
 */
export function useAppTheme() {
  const systemColorScheme = useColorScheme()
  const { getItem, setItem } = useAsyncStorage()
  
  const [colorMode, setColorMode] = useState<ColorMode>('dark')
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme from storage or system preference
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedMode = await getItem(THEME_STORAGE_KEY)
        if (savedMode && (savedMode === 'dark' || savedMode === 'light')) {
          setColorMode(savedMode as ColorMode)
        } else if (systemColorScheme && (systemColorScheme === 'dark' || systemColorScheme === 'light')) {
          setColorMode(systemColorScheme)
        } else {
          // Default to dark for fisherman environment
          setColorMode('dark')
        }
      } catch (error) {
        // Fallback to dark mode on error
        setColorMode('dark')
      } finally {
        setIsInitialized(true)
      }
    }

    initializeTheme()
  }, [getItem, systemColorScheme])

  const toggleTheme = async () => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark'
    setColorMode(newMode)
    try {
      await setItem(THEME_STORAGE_KEY, newMode)
    } catch (error) {
      console.error('Failed to save theme preference', error)
    }
  }

  const colors = colorMode === 'dark' ? darkColors : lightColors

  const theme: Theme = {
    mode: colorMode,
    colors: colors,
    typography: designTokens.typography,
    spacing: designTokens.spacing,
    borderRadius: designTokens.borderRadius,
    shadows: designTokens.shadows,
    accessibility: designTokens.accessibility,
    componentTokens: designTokens.componentTokens,
    motion: designTokens.motion,
  }

  return {
    theme,
    colorMode,
    toggleTheme,
    isInitialized,
  }
}

export type { ColorMode, Theme }

