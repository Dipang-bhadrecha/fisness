import { Platform } from 'react-native'

/**
 * ══════════════════════════════════════════════════════════════
 * MATSYAKOSH — DESIGN TOKENS v1.1
 * Professional Design System for Fisherman-First Engagement
 * ══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE — DARK MODE (Primary)
// ─────────────────────────────────────────────────────────────
export const darkColors = {
  // Backgrounds — Layered Depth
  bgBase: '#080F1A',          // Primary background (WCAG AAA)
  bgSurface: '#0D1B2E',       // Cards, surfaces
  bgElevated: '#132640',      // Elevated/modal backgrounds
  bgOverlay: '#080F1A99',     // 60% opacity overlay

  // Primary Brand Colors
  primary: '#00C2CB',         // Primary teal
  primaryLight: '#1FD7E0',    // Hover state
  primaryDark: '#0A8A93',     // Active/pressed state
  primaryMuted: '#00C2CB1A',  // 10% opacity for backgrounds

  // Secondary Accent (Gold)
  gold: '#C9A84C',
  goldLight: '#D9B86A',
  goldDark: '#A0721A',
  goldMuted: '#C9A84C0F',

  // Status Colors
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Text Hierarchy
  textPrimary: '#F0F4F8',
  textSecondary: '#8BA3BC',
  textMuted: '#3D5A73',
  textInverse: '#080F1A',

  // Borders & Dividers
  border: 'rgba(0, 194, 203, 0.1)',
  borderStrong: 'rgba(0, 194, 203, 0.2)',
  divider: 'rgba(139, 163, 188, 0.08)',

  // Special States
  disabled: 'rgba(61, 90, 115, 0.5)',
  focus: 'rgba(0, 194, 203, 0.3)',
} as const

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE — LIGHT MODE (Secondary)
// ─────────────────────────────────────────────────────────────
export const lightColors = {
  bgBase: '#F5F8FB',
  bgSurface: '#FFFFFF',
  bgElevated: '#EAF1F8',
  bgOverlay: '#F5F8FBCC',

  primary: '#006D77',
  primaryLight: '#00A3B8',
  primaryDark: '#004D57',
  primaryMuted: '#006D770D',

  gold: '#A0721A',
  goldLight: '#B8892E',
  goldDark: '#7A5A00',
  goldMuted: '#A0721A0F',

  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',

  textPrimary: '#0D1B2E',
  textSecondary: '#4A6580',
  textMuted: '#9DB5C8',
  textInverse: '#F0F4F8',

  border: 'rgba(0, 109, 119, 0.12)',
  borderStrong: 'rgba(0, 109, 119, 0.2)',
  divider: 'rgba(74, 101, 128, 0.08)',

  disabled: 'rgba(157, 181, 200, 0.5)',
  focus: 'rgba(0, 109, 119, 0.2)',
} as const

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY SYSTEM
// ─────────────────────────────────────────────────────────────
export const typography = {
  fontSize: {
    xs:   10,
    sm:   12,
    md:   14,
    lg:   16,
    xl:   18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal:    '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },
  fontFamily: {
    sans:  undefined, // System default
    mono:  'Courier New',
  },
}

// ─────────────────────────────────────────────────────────────
// SPACING — 8pt Grid
// ─────────────────────────────────────────────────────────────
export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  // Named aliases
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
} as const

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────
export const borderRadius = {
  none:   0,
  xs:     4,
  sm:     8,
  md:     12,
  lg:     16,
  xl:     20,
  pill:   999,
  circle: 999,
} as const

// ─────────────────────────────────────────────────────────────
// SHADOWS — Cross-platform (iOS/Android + Web)
//
// On web (Expo SDK 53+), React Native deprecated shadow* props
// in favour of boxShadow (CSS string). This helper returns the
// right shape for the current platform so there are zero warnings.
// ─────────────────────────────────────────────────────────────
function makeShadow(
  elevation: number,
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
) {
  if (Platform.OS === 'web') {
    // CSS boxShadow string — no deprecated warnings on web
    const hex = color === '#000000' ? '0,0,0' : '0,0,0'
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(${hex}, ${opacity})`,
    }
  }
  // Native (iOS elevation handled by shadowColor/Offset/Opacity/Radius; Android by elevation)
  return {
    elevation,
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  }
}

export const shadows = {
  none: Platform.OS === 'web'
    ? { boxShadow: 'none' }
    : { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },

  sm:  makeShadow(1,  '#000000', 1,  0.08, 2),
  md:  makeShadow(2,  '#000000', 2,  0.12, 4),
  lg:  makeShadow(4,  '#000000', 4,  0.15, 8),
  xl:  makeShadow(8,  '#000000', 8,  0.20, 16),
} as const

// ─────────────────────────────────────────────────────────────
// TEAL GLOW — used on primary CTA buttons
// A coloured shadow that matches the brand
// ─────────────────────────────────────────────────────────────
export const tealGlow = Platform.OS === 'web'
  ? { boxShadow: '0px 8px 20px rgba(0, 194, 203, 0.4)' }
  : {
      elevation: 10,
      shadowColor: '#00C2CB',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
    }

export const tealGlowOff = Platform.OS === 'web'
  ? { boxShadow: 'none' }
  : { elevation: 0, shadowOpacity: 0 }

// ─────────────────────────────────────────────────────────────
// ACCESSIBILITY
// ─────────────────────────────────────────────────────────────
export const accessibility = {
  touchTargetMin:       48,
  touchTargetPreferred: 64,
  focusRing:            2,
  contrastMinimum:      4.5,
  contrastEnhanced:     7,
} as const

// ─────────────────────────────────────────────────────────────
// MOTION / ANIMATION
// ─────────────────────────────────────────────────────────────
export const motion = {
  fast:   150,
  normal: 250,
  slow:   400,
  spring: { damping: 15, stiffness: 150 },
} as const

// ─────────────────────────────────────────────────────────────
// COMPONENT TOKENS
// ─────────────────────────────────────────────────────────────
export const componentTokens = {
  input: {
    height:        56,
    borderRadius:  12,
    paddingH:      16,
    fontSize:      16,
  },
  card: {
    borderRadius:  16,
    padding:       16,
    borderWidth:   1,
  },
  button: {
    heightSm:  40,
    heightMd:  56,
    heightLg:  64,
    borderRadius: 12,
  },
  bottomNav: {
    height:      64,
    paddingBottom: 8,
  },
} as const

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS EXPORT
// ─────────────────────────────────────────────────────────────
export const designTokens = {
  typography,
  spacing,
  borderRadius,
  shadows,
  tealGlow,
  tealGlowOff,
  accessibility,
  motion,
  componentTokens,
}