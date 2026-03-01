import { darkColors, designTokens, lightColors } from './designTokens'

/**
 * ══════════════════════════════════════════════════════════════
 * DEFAULT THEME EXPORT (Dark Mode)
 * Used as fallback when hook is not available
 * ══════════════════════════════════════════════════════════════
 */
export const theme = {
  // Dark mode colors (primary theme for fisherman environment)
  colors: {
    // ─── BACKGROUNDS ───────────────────────
    background: darkColors.bgBase,
    surface: darkColors.bgSurface,
    elevated: darkColors.bgElevated,
    overlay: darkColors.bgOverlay,

    // ─── TEXT ──────────────────────────────
    textPrimary: darkColors.textPrimary,
    textSecondary: darkColors.textSecondary,
    textMuted: darkColors.textMuted,
    textInverse: darkColors.textInverse,
    textDisabled: darkColors.disabled,

    // ─── BRAND ─────────────────────────────
    primary: darkColors.primary,
    primaryLight: darkColors.primaryLight,
    primaryDark: darkColors.primaryDark,
    primaryMuted: darkColors.primaryMuted,

    // ─── SECONDARY ─────────────────────────
    gold: darkColors.gold,
    goldLight: darkColors.goldLight,
    goldDark: darkColors.goldDark,

    // ─── STATUS ────────────────────────────
    success: darkColors.success,
    danger: darkColors.danger,
    warning: darkColors.warning,
    pause: '#E8B800', // Legacy pause color for compatibility

    // Legacy pause colors
    pauseBg: '#FFFAED',
    pauseText: '#7A5A00',

    // ─── BORDERS ───────────────────────────
    border: darkColors.border,
    borderStrong: darkColors.borderStrong,
    divider: darkColors.divider,

    // ─── SPECIAL ────────────────────────────
    focus: darkColors.focus,
    disabled: darkColors.disabled,
  },

  // Typography system
  fontSize: designTokens.typography.fontSize,
  lineHeight: designTokens.typography.lineHeight,
  fontWeight: designTokens.typography.fontWeight,
  fontFamily: designTokens.typography.fontFamily,

  // Spacing scale (8pt grid)
  spacing: designTokens.spacing,

  // Border radius tokens
  radius: designTokens.borderRadius,

  // Shadows/elevation system
  shadows: designTokens.shadows,

  // Component-specific tokens
  componentTokens: designTokens.componentTokens,

  // Accessibility guidelines
  touchTarget: designTokens.accessibility.touchTargetPreferred, // 64px for wet hands
  minTouchTarget: designTokens.accessibility.touchTargetMin,   // 48px fallback
  focusRing: designTokens.accessibility.focusRing,
  contrastMinimum: designTokens.accessibility.contrastMinimum,
  contrastEnhanced: designTokens.accessibility.contrastEnhanced,

  // Animation/motion
  motion: designTokens.motion,
}

/**
 * Light mode theme variant
 * Same structure as dark theme but with light colors
 */
export const lightTheme = {
  colors: {
    background: lightColors.bgBase,
    surface: lightColors.bgSurface,
    elevated: lightColors.bgElevated,
    overlay: lightColors.bgOverlay,

    textPrimary: lightColors.textPrimary,
    textSecondary: lightColors.textSecondary,
    textMuted: lightColors.textMuted,
    textInverse: lightColors.textInverse,
    textDisabled: lightColors.disabled,

    primary: lightColors.primary,
    primaryLight: lightColors.primaryLight,
    primaryDark: lightColors.primaryDark,
    primaryMuted: lightColors.primaryMuted,

    gold: lightColors.gold,
    goldLight: lightColors.goldLight,
    goldDark: lightColors.goldDark,

    success: lightColors.success,
    danger: lightColors.danger,
    warning: lightColors.warning,
    pause: '#D97706',

    pauseBg: '#FEF3C7',
    pauseText: '#92400E',

    border: lightColors.border,
    borderStrong: lightColors.borderStrong,
    divider: lightColors.divider,

    focus: lightColors.focus,
    disabled: lightColors.disabled,
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

export type ColorMode = 'dark' | 'light'
export { designTokens }
