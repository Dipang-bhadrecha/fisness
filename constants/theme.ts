import { Appearance } from 'react-native'
import { darkColors, designTokens, lightColors } from './designTokens'

export type ColorMode = 'dark' | 'light'

function buildTheme(mode: ColorMode) {
  const c = mode === 'dark' ? darkColors : lightColors
  const pause = mode === 'dark'
    ? { pause: '#E8B800', pauseBg: '#FFFAED', pauseText: '#7A5A00' }
    : { pause: '#D97706', pauseBg: '#FEF3C7', pauseText: '#92400E' }

  return {
    colors: {
      background: c.bgBase,
      surface: c.bgSurface,
      elevated: c.bgElevated,
      overlay: c.bgOverlay,

      textPrimary: c.textPrimary,
      textSecondary: c.textSecondary,
      textMuted: c.textMuted,
      textInverse: c.textInverse,
      textDisabled: c.disabled,

      primary: c.primary,
      primaryLight: c.primaryLight,
      primaryDark: c.primaryDark,
      primaryMuted: c.primaryMuted,

      gold: c.gold,
      goldLight: c.goldLight,
      goldDark: c.goldDark,

      success: c.success,
      danger: c.danger,
      warning: c.warning,
      pause: pause.pause,
      pauseBg: pause.pauseBg,
      pauseText: pause.pauseText,

      border: c.border,
      borderStrong: c.borderStrong,
      divider: c.divider,

      focus: c.focus,
      disabled: c.disabled,
    },

    fontSize: designTokens.typography.fontSize,
    lineHeight: designTokens.typography.lineHeight,
    fontWeight: designTokens.typography.fontWeight,
    fontFamily: designTokens.typography.fontFamily,

    spacing: designTokens.spacing,
    radius: designTokens.borderRadius,
    shadows: designTokens.shadows,
    componentTokens: designTokens.componentTokens,

    touchTarget: designTokens.accessibility.touchTargetPreferred,
    minTouchTarget: designTokens.accessibility.touchTargetMin,
    focusRing: designTokens.accessibility.focusRing,
    contrastMinimum: designTokens.accessibility.contrastMinimum,
    contrastEnhanced: designTokens.accessibility.contrastEnhanced,

    motion: designTokens.motion,
  }
}

export const darkTheme = buildTheme('dark')
export const lightTheme = buildTheme('light')

const initialMode: ColorMode = Appearance.getColorScheme() === 'light' ? 'light' : 'dark'
export const theme = buildTheme(initialMode)

export function setThemeMode(mode: ColorMode) {
  Object.assign(theme, mode === 'dark' ? darkTheme : lightTheme)
}

export { designTokens }
