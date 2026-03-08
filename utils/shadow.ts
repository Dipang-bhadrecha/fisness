/**
 * utils/shadow.ts
 *
 * Cross-platform shadow helper.
 *
 * Usage (replaces inline shadow* props):
 *   import { shadow, coloredShadow } from '../utils/shadow'
 *
 *   // Generic dark shadow
 *   style={[s.card, shadow(4, 0.15, 8)]}
 *
 *   // Coloured glow (e.g. teal CTA button)
 *   style={[s.btn, coloredShadow('#00C2CB', 8, 0.4, 20)]}
 */

import { Platform } from 'react-native'

/**
 * Returns platform-correct shadow style.
 * @param elevation  Android elevation / iOS z-depth hint
 * @param opacity    Shadow opacity (0–1)
 * @param radius     Blur radius in dp
 * @param offsetY    Vertical offset in dp (default 4)
 * @param color      Shadow colour (default #000000)
 */
export function shadow(
  elevation: number,
  opacity: number,
  radius: number,
  offsetY = 4,
  color = '#000000',
): object {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0,0,0,${opacity})`,
    }
  }
  return {
    elevation,
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  }
}

/**
 * Coloured glow shadow — for brand-coloured buttons/cards.
 * @param hex     Colour in hex, e.g. '#00C2CB'
 * @param offsetY Vertical offset
 * @param opacity Shadow opacity
 * @param radius  Blur radius
 */
export function coloredShadow(
  hex: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation = 10,
): object {
  if (Platform.OS === 'web') {
    // Convert hex to rgb for rgba() — handles 6-digit hex
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(${r},${g},${b},${opacity})`,
    }
  }
  return {
    elevation,
    shadowColor: hex,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  }
}

/** Removes all shadow on all platforms */
export const noShadow: object = Platform.OS === 'web'
  ? { boxShadow: 'none' }
  : { elevation: 0, shadowOpacity: 0 }