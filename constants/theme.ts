import { Appearance } from 'react-native'
import {
  darkColors,
  darkShadows,
  designTokens,
  fixedColors,
  labels,
  lightColors,
  lightShadows,
} from './designTokens'

export type ColorMode = 'dark' | 'light'

function buildTheme(mode: ColorMode) {
  const c = mode === 'dark' ? darkColors : lightColors
  // Guide: shadows only in light mode — dark mode uses bg color steps for elevation
  const s = mode === 'dark' ? darkShadows : lightShadows

  return {
    mode,

    colors: {
      // ── Backgrounds ────────────────────────────────────────
      background: c.bgBase,
      surface:    c.bgSurface,
      elevated:   c.bgElevated,
      overlay:    c.bgOverlay,

      // ── Text ───────────────────────────────────────────────
      textPrimary:   c.textPrimary,
      textSecondary: c.textSecondary,
      textMuted:     c.textMuted,
      textInverse:   c.textInverse,
      textDisabled:  c.disabled,

      // ── Primary Brand ──────────────────────────────────────
      primary:      c.primary,
      primaryLight: c.primaryLight,
      primaryDark:  c.primaryDark,
      primaryMuted: c.primaryMuted,

      // ── Action / CTA Orange ────────────────────────────────
      action:      c.action,
      actionLight: c.actionLight,
      actionDark:  c.actionDark,
      actionMuted: c.actionMuted,

      // ── Status ─────────────────────────────────────────────
      success:      c.success,
      successMuted: c.successMuted,
      danger:       c.danger,
      dangerMuted:  c.dangerMuted,
      warning:      c.warning,

      // ── Pause / Hold ───────────────────────────────────────
      pause:     c.pause,
      pauseBg:   c.pauseBg,
      pauseText: c.pauseText,

      // ── Borders ────────────────────────────────────────────
      border:       c.border,
      borderStrong: c.borderStrong,
      divider:      c.divider,
      focus:        c.focus,
      disabled:     c.disabled,

      // ── Fixed colors (never change with theme) ─────────────
      whatsapp:      fixedColors.whatsapp,
      whatsappText:  fixedColors.whatsappText,
      incomeArrow:   fixedColors.incomeArrow,
      expenseArrow:  fixedColors.expenseArrow,
      tripActive:    fixedColors.tripActive,
      statusSold:    fixedColors.statusSold,
      statusPending: fixedColors.statusPending,
    },

    // ── Typography ───────────────────────────────────────────
    fontSize:   designTokens.typography.fontSize,
    lineHeight: designTokens.typography.lineHeight,
    fontWeight: designTokens.typography.fontWeight,
    fontFamily: designTokens.typography.fontFamily,

    // ── Layout ───────────────────────────────────────────────
    spacing: designTokens.spacing,
    radius:  designTokens.borderRadius,

    // ── Shadows — mode-aware ──────────────────────────────────
    // dark mode = all noShadow, light mode = subtle single-layer
    shadows:     s,
    actionGlow:  designTokens.actionGlow,
    primaryGlow: designTokens.primaryGlow,

    // ── Component sizes ──────────────────────────────────────
    componentTokens: designTokens.componentTokens,

    // ── Accessibility ─────────────────────────────────────────
    touchTarget:      designTokens.accessibility.touchTargetPreferred,
    minTouchTarget:   designTokens.accessibility.touchTargetMin,
    iconSize:         designTokens.accessibility.iconSizePreferred,
    minIconSize:      designTokens.accessibility.iconSizeMin,
    tapSpacing:       designTokens.accessibility.tapSpacingMin,
    focusRing:        designTokens.accessibility.focusRing,
    contrastMinimum:  designTokens.accessibility.contrastMinimum,
    contrastEnhanced: designTokens.accessibility.contrastEnhanced,

    // ── Motion ───────────────────────────────────────────────
    motion: designTokens.motion,

    // ── Bilingual labels ─────────────────────────────────────
    labels,
  }
}

export const darkTheme  = buildTheme('dark')
export const lightTheme = buildTheme('light')

// Default: system preference, fallback to dark (outdoor fishermen)
const initialMode: ColorMode = Appearance.getColorScheme() === 'light' ? 'light' : 'dark'
export const theme = buildTheme(initialMode)

export function setThemeMode(mode: ColorMode) {
  Object.assign(theme, mode === 'dark' ? darkTheme : lightTheme)
}

export { designTokens, fixedColors, labels }
