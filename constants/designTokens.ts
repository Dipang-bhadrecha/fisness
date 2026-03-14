import { Platform } from 'react-native'

/**
 * ══════════════════════════════════════════════════════════════
 * MATSYAKOSH — DESIGN TOKENS v2.1
 * Fisherman-First Design System
 * Updated: Light/Dark colors aligned to outdoor readability guide
 * ══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE — DARK MODE
// Guide: avoid pure black — use layered charcoal for depth
// No shadows in dark mode — elevation via bg color steps only
// ─────────────────────────────────────────────────────────────
export const darkColors = {
  // Backgrounds — three-layer depth (guide: #121212 / #1E1E1E / #2A2A2A)
  bgBase:     '#121212',        // Page background — dark charcoal, not pure black
  bgSurface:  '#1E1E1E',        // Cards — one step lighter
  bgElevated: '#2A2A2A',        // Modals, bottom sheets — two steps lighter
  bgOverlay:  '#12121299',      // 60% opacity overlay

  // Primary Brand — lightened for dark bg (guide: glow, not absorb)
  primary:      '#4D9EFF',      // Blue lighter variant for dark mode
  primaryLight: '#80BBFF',
  primaryDark:  '#0066CC',
  primaryMuted: '#4D9EFF1A',

  // Action / CTA Orange (guide: #FF9933 dark)
  action:      '#FF9933',
  actionLight: '#FFB366',
  actionDark:  '#FF7C00',
  actionMuted: '#FF99331A',

  // Success / Income (guide: #33BB66 — lighter for dark bg visibility)
  success:      '#33BB66',
  successMuted: '#33BB661A',

  // Danger / Expense (guide: #FF5555 — lighter for dark bg visibility)
  danger:      '#FF5555',
  dangerMuted: '#FF55551A',

  // Warning
  warning: '#F59E0B',

  // Text (guide: never pure white — use #E8E8E6 warm off-white)
  textPrimary:   '#E8E8E6',     // Warm off-white — easier on eyes at night
  textSecondary: '#9A9A98',     // Secondary labels
  textMuted:     '#5A5A58',     // Disabled / placeholder
  textInverse:   '#121212',

  // Borders (guide: #333331 cards, #2C2C2A dividers — very subtle)
  border:       '#333331',
  borderStrong: '#444442',
  divider:      '#2C2C2A',

  // Special States
  disabled: 'rgba(90, 90, 88, 0.5)',
  focus:    'rgba(77, 158, 255, 0.35)',

  // Pause / Hold
  pause:     '#E8B800',
  pauseBg:   '#2A2510',
  pauseText: '#E8B800',
} as const

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE — LIGHT MODE
// Guide: anti-glare warm off-white, NOT pure white bg
// Deep enough blues/greens/reds to pass 7:1 on white in sun
// ─────────────────────────────────────────────────────────────
export const lightColors = {
  // Backgrounds (guide: #F2F2F0 — warm off-white, not pure #FFFFFF)
  bgBase:     '#F2F2F0',        // Warm off-white — no sun glare
  bgSurface:  '#FFFFFF',        // Cards on top of base
  bgElevated: '#F8F8F6',        // Modals, bottom sheets
  bgOverlay:  '#F2F2F0CC',

  // Primary Brand (guide: #0055BB — deeper blue for sunlight legibility)
  primary:      '#0055BB',      // Deeper than standard blue — legible in sun
  primaryLight: '#4D9EFF',
  primaryDark:  '#003D8A',
  primaryMuted: '#0055BB14',

  // Action / CTA Orange (guide: #E06F00 — dark enough for white text at 7:1)
  action:      '#E06F00',
  actionLight: '#FF9933',
  actionDark:  '#B85800',
  actionMuted: '#E06F0014',

  // Success / Income (guide: #007A36 — deep green for sun legibility)
  success:      '#007A36',
  successMuted: '#007A361A',

  // Danger / Expense (guide: #BB0000 — deep red for sun legibility)
  danger:      '#BB0000',
  dangerMuted: '#BB00001A',

  // Warning
  warning: '#D97706',

  // Text (guide: #111111 — near-black, not pure black)
  textPrimary:   '#111111',     // Near-black — less harsh than #000000
  textSecondary: '#555555',     // Medium gray labels
  textMuted:     '#999999',     // Placeholder / disabled
  textInverse:   '#FFFFFF',

  // Borders (guide: #D8D8D6 cards, #EBEBEA dividers — never pure black)
  border:       '#D8D8D6',
  borderStrong: '#C0C0BE',
  divider:      '#EBEBEA',

  // Special States
  disabled: 'rgba(153, 153, 153, 0.5)',
  focus:    'rgba(0, 85, 187, 0.25)',

  // Pause / Hold
  pause:     '#D97706',
  pauseBg:   '#FEF3C7',
  pauseText: '#92400E',
} as const

// ─────────────────────────────────────────────────────────────
// FIXED COLORS — Never change between light/dark
// Guide: WhatsApp, status badges always stay constant for recognition
// ─────────────────────────────────────────────────────────────
export const fixedColors = {
  whatsapp:      '#25D366',     // WhatsApp share — always this, always recognized
  whatsappText:  '#FFFFFF',
  incomeArrow:   '#007A36',     // ↑ income arrow — fixed (not color alone, also has ↑ icon)
  expenseArrow:  '#BB0000',     // ↓ expense arrow — fixed (not color alone, also has ↓ icon)
  tripActive:    '#0055BB',     // "Trip Active" badge — fixed
  statusSold:    '#007A36',     // "Sold" badge — fixed
  statusPending: '#D97706',     // "Pending" badge — fixed amber
} as const

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY SYSTEM
// ─────────────────────────────────────────────────────────────
export const typography = {
  fontSize: {
    xs:    10,
    sm:    12,
    md:    14,
    lg:    16,
    xl:    18,
    xxl:   20,
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
    sans:    undefined,
    display: undefined,
    mono:    'Courier New',
  },
} as const

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
// SHADOWS
// Guide: NO shadows in dark mode — depth via bg color steps only
//        Light mode: single subtle layer max 0.10 opacity
// ─────────────────────────────────────────────────────────────
function makeShadow(
  elevation: number,
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
) {
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` }
  }
  return {
    elevation,
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  }
}

const noShadow = Platform.OS === 'web'
  ? { boxShadow: 'none' }
  : { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 }

// Light mode — subtle single-layer shadows only (guide: max 0.10 opacity)
export const lightShadows = {
  none: noShadow,
  sm:   makeShadow(1, '#000000', 1, 0.08, 2),
  md:   makeShadow(2, '#000000', 1, 0.10, 3),
  lg:   makeShadow(3, '#000000', 2, 0.10, 6),
  xl:   makeShadow(4, '#000000', 2, 0.12, 8),
} as const

// Dark mode — NO shadows at all (guide: elevation = bg color only)
export const darkShadows = {
  none: noShadow,
  sm:   noShadow,
  md:   noShadow,
  lg:   noShadow,
  xl:   noShadow,
} as const

// Static default (dark) — used by non-reactive static theme import
export const shadows = darkShadows

// CTA button glows — light mode only, meaningful brand highlights
export const actionGlow = Platform.OS === 'web'
  ? { boxShadow: '0px 3px 10px rgba(224, 111, 0, 0.28)' }
  : { elevation: 4, shadowColor: '#E06F00', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.28, shadowRadius: 10 }

export const primaryGlow = Platform.OS === 'web'
  ? { boxShadow: '0px 3px 10px rgba(0, 85, 187, 0.22)' }
  : { elevation: 3, shadowColor: '#0055BB', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 10 }

// ─────────────────────────────────────────────────────────────
// ACCESSIBILITY — WCAG AAA 7:1
// ─────────────────────────────────────────────────────────────
export const accessibility = {
  touchTargetMin:       56,
  touchTargetPreferred: 64,
  iconSizeMin:          28,
  iconSizePreferred:    36,
  tapSpacingMin:        12,
  focusRing:            2,
  contrastMinimum:      7,
  contrastEnhanced:     7,
} as const

// ─────────────────────────────────────────────────────────────
// MOTION
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
    height:       56,
    borderRadius: 12,
    paddingH:     16,
    fontSize:     16,
  },
  card: {
    borderRadius: 16,
    padding:      16,
    borderWidth:  1,
  },
  button: {
    heightSm:     48,
    heightMd:     56,
    heightLg:     64,
    borderRadius: 12,
  },
  bottomNav: {
    height:        64,
    paddingBottom: 8,
  },
  header:    { height: 52 },
  statusBar: { height: 28 },
} as const

// ─────────────────────────────────────────────────────────────
// BILINGUAL LABELS — English + Romanized Gujarati
// Guide: color is never the only signal — labels include ↑↓ arrows too
// ─────────────────────────────────────────────────────────────
export const labels = {
  home:          { en: 'Home',              gu: 'Ghar' },
  records:       { en: 'Records',           gu: 'Nondh' },
  expenses:      { en: 'Expenses',          gu: 'Kharch' },
  profile:       { en: 'Profile',           gu: 'Parichy' },
  addCatch:      { en: 'Add Catch',         gu: 'Pakad Uksero' },
  sell:          { en: 'Sell',              gu: 'Vecho' },
  addExpense:    { en: 'Add Expense',       gu: 'Kharch Uksero' },
  totalCatch:    { en: 'Total Catch',       gu: 'Kul Pakad' },
  totalSale:     { en: 'Total Sold',        gu: 'Kul Vechel' },
  totalSpent:    { en: 'Total Spent',       gu: 'Kul Kharch' },
  netIncome:     { en: 'Net Income',        gu: 'Net Aavak' },
  weight:        { en: 'Weight (kg)',       gu: 'Vajan (kg)' },
  price:         { en: 'Price (₹/kg)',      gu: 'Bhav (₹/kg)' },
  date:          { en: 'Date',              gu: 'Tarik' },
  boat:          { en: 'Boat',              gu: 'Naav' },
  trip:          { en: 'Trip',              gu: 'Safar' },
  pomfret:       { en: 'Pomfret',           gu: 'Paplet' },
  surmai:        { en: 'Surmai',            gu: 'Surmai' },
  bombil:        { en: 'Bombay Duck',       gu: 'Bombil' },
  rawas:         { en: 'Rawas',             gu: 'Rawas' },
  other:         { en: 'Other',             gu: 'Biju' },
  // Arrow icons alongside color — guide: never color alone
  income:        { en: '↑ Income',          gu: '↑ Aavak' },
  expense:       { en: '↓ Expense',         gu: '↓ Kharch' },
  offline:       { en: 'Offline — saved locally', gu: 'Offline — locally sachu' },
  synced:        { en: 'Synced ✓',          gu: 'Sync thyu ✓' },
  shareWhatsApp: { en: 'Share on WhatsApp', gu: 'WhatsApp par moklo' },
} as const

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS EXPORT
// ─────────────────────────────────────────────────────────────
export const designTokens = {
  typography,
  spacing,
  borderRadius,
  lightShadows,
  darkShadows,
  shadows,
  actionGlow,
  primaryGlow,
  accessibility,
  motion,
  componentTokens,
  labels,
  fixedColors,
}