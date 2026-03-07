/**
 * ══════════════════════════════════════════════════════════════
 * MATSYAKOSH — DESIGN TOKENS v1.0
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
  primary: '#00C2CB',         // Primary teal (Accessible for all text sizes)
  primaryLight: '#1FD7E0',    // Hover state
  primaryDark: '#0A8A93',     // Active/pressed state
  primaryMuted: '#00C2CB1A',  // 10% opacity for backgrounds

  // Secondary Accent (Gold)
  gold: '#C9A84C',            // Premium, warm accent
  goldLight: '#D9B86A',       // Hover state
  goldDark: '#A0721A',        // Active state
  goldMuted: '#C9A84C0F',     // 6% opacity backgrounds

  // Status Colors — Must meet WCAG AA for all uses
  success: '#22C55E',         // Green — Success/complete (Contrast: 11:1 with bg)
  warning: '#F59E0B',         // Amber — Warning (Contrast: 5.5:1 with bg)
  danger: '#EF4444',          // Red — Errors/destructive (Contrast: 4.5:1 with bg)

  // Text Hierarchy
  textPrimary: '#F0F4F8',     // Main text (Contrast: 19.5:1 with bgBase)
  textSecondary: '#8BA3BC',   // Secondary/labels (Contrast: 7.8:1 with bgBase)
  textMuted: '#3D5A73',       // Disabled/tertiary (Contrast: 3.5:1 with bgBase)
  textInverse: '#080F1A',     // For light backgrounds

  // Borders & Dividers
  border: 'rgba(0, 194, 203, 0.1)',      // Primary teal border
  borderStrong: 'rgba(0, 194, 203, 0.2)', // Stronger border
  divider: 'rgba(139, 163, 188, 0.08)',   // Subtle divider

  // Special States
  disabled: 'rgba(61, 90, 115, 0.5)',    // Disabled elements
  focus: 'rgba(0, 194, 203, 0.3)',       // Focus ring
} as const

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE — LIGHT MODE (Secondary)
// ─────────────────────────────────────────────────────────────
export const lightColors = {
  // Backgrounds
  bgBase: '#F5F8FB',          // Light background
  bgSurface: '#FFFFFF',       // Cards/surfaces
  bgElevated: '#EAF1F8',      // Elevated backgrounds
  bgOverlay: '#F5F8FBCC',     // 80% opacity overlay

  // Primary Brand
  primary: '#006D77',         // Dark teal
  primaryLight: '#00A3B8',    // Hover
  primaryDark: '#004D57',     // Active
  primaryMuted: '#006D770D',  // 5% opacity

  // Secondary
  gold: '#A0721A',            // Dark gold
  goldLight: '#B8892E',       // Hover
  goldDark: '#7A5A00',        // Active
  goldMuted: '#A0721A0F',     // 6% opacity

  // Status
  success: '#16A34A',         // Dark green
  warning: '#D97706',         // Dark amber
  danger: '#DC2626',          // Dark red

  // Text
  textPrimary: '#0D1B2E',     // Main text
  textSecondary: '#4A6580',   // Secondary
  textMuted: '#9DB5C8',       // Tertiary
  textInverse: '#F0F4F8',     // For dark backgrounds

  // Borders
  border: 'rgba(0, 109, 119, 0.12)',
  borderStrong: 'rgba(0, 109, 119, 0.2)',
  divider: 'rgba(74, 101, 128, 0.08)',

  // Special
  disabled: 'rgba(157, 181, 200, 0.5)',
  focus: 'rgba(0, 109, 119, 0.2)',
} as const

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY SYSTEM
// ─────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    display: 'Cormorant Garamond',     // Headlines, hero text
    body: 'DM Sans',                   // Body, UI, default
    mono: 'DM Mono',                   // Code, numbers
  },

  // Font Scale (px) — Cormorant Garamond for display (serif)
  // DM Sans for body content (optimized for fishing scenario)
  fontSize: {
    xs: 10,      // Micro labels, captions
    sm: 12,      // Small text, helper text
    md: 14,      // Body text, default
    lg: 16,      // Prominent text, labels
    xl: 20,      // Subheadings
    xxl: 28,     // Section headings
    xxxl: 36,    // Page titles
    huge: 48,    // Display/hero
    giant: 64,   // Maximum display
  },

  lineHeight: {
    tight: 1.2,  // Headlines
    normal: 1.5, // Body
    relax: 1.75, // Long-form
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const

// ─────────────────────────────────────────────────────────────
// SPACING SYSTEM (8pt Grid)
// ─────────────────────────────────────────────────────────────
export const spacing = {
  0: 0,
  1: 4,      // sp-1 — Icon gap, micro spacing
  2: 8,      // sp-2 — Text gap, list item gap
  3: 12,     // sp-3 — Card inner padding (compact)
  4: 16,     // sp-4 — Card inner padding (base unit)
  6: 24,     // sp-6 — Page horizontal padding
  8: 32,     // sp-8 — Section breaks
  12: 48,    // sp-12 — Major section breaks
  16: 64,    // sp-16 — Page margins
} as const

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS — Accessible Touch Targets
// ─────────────────────────────────────────────────────────────
export const borderRadius = {
  none: 0,
  sm: 8,      // Subtle rounding
  md: 12,     // Default, cards
  lg: 16,     // Large components
  xl: 20,     // Prominent elements
  pill: 999,  // Fully rounded
  circle: 999, // Perfect circle
} as const

// ─────────────────────────────────────────────────────────────
// SHADOWS — Elevation System (Material Design inspired)
// ─────────────────────────────────────────────────────────────
export const shadows = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  md: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  lg: {
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  xl: {
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
} as const

// ─────────────────────────────────────────────────────────────
// ACCESSIBILITY — Touch Targets & Interactive Areas
// ─────────────────────────────────────────────────────────────
export const accessibility = {
  // Minimum touch target: 48x48dp (per WCAG, Material Design)
  // Fishermen environment: 64x64dp (wet/rough hands)
  touchTargetMin: 48,
  touchTargetPreferred: 64,  // Used for main buttons, tappable areas

  // Focus indicator width
  focusRing: 2,

  // Minimum color contrast ratios (WCAG)
  contrastMinimum: 4.5,      // AA level
  contrastEnhanced: 7,       // AAA level
} as const

// ─────────────────────────────────────────────────────────────
// COMPONENT-SPECIFIC TOKEN PRESETS
// ─────────────────────────────────────────────────────────────
export const componentTokens = {
  button: {
    height: {
      sm: 40,
      md: 48,
      lg: 56,
    },
    padding: {
      sm: { horizontal: 12, vertical: 8 },
      md: { horizontal: 16, vertical: 12 },
      lg: { horizontal: 20, vertical: 14 },
    },
  },
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  badge: {
    padding: { horizontal: 8, vertical: 4 },
    borderRadius: borderRadius.pill,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.md,
  },
  modal: {
    borderRadiusTop: borderRadius.xl,
    padding: spacing[6],
  },
} as const

// ─────────────────────────────────────────────────────────────
// TRANSITIONS & ANIMATIONS
// ─────────────────────────────────────────────────────────────
export const motion = {
  duration: {
    fast: 150,      // Very quick interactions
    normal: 250,    // Standard animations
    slow: 350,      // Deliberate animations
    verySlow: 500,  // Attention-grabbing
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const

// ─────────────────────────────────────────────────────────────
// EXPORTED DESIGN TOKEN SET
// ─────────────────────────────────────────────────────────────
export const designTokens = {
  dark: darkColors,
  light: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  accessibility,
  componentTokens,
  motion,
} as const

export type DesignTokens = typeof designTokens
export type ColorMode = 'dark' | 'light'
