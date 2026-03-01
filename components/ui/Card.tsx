/**
 * Card Component — Elevated Surface Container
 * Professional design with proper shadows and spacing
 * Supports multiple variants: default, elevated, bordered
 */

import React from 'react'
import {
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native'
import { theme } from '../../constants/theme'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onPress?: () => void
  style?: ViewStyle
  testID?: string
}

/**
 * Reusable Card component with semantic elevation
 * - default: Standard surface with subtle shadow (elevation 1-2)
 * - elevated: Higher elevation for emphasis (elevation 4+)
 * - bordered: Outlined style for secondary content
 * - ghost: No background, minimal styling
 */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  testID,
}: CardProps) {
  const content = (
    <View style={[styles.base, styles[variant], styles[`padding_${padding}`], style]}>
      {children}
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{
          color: theme.colors.primary,
          foreground: true,
        }}
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
        testID={testID}
      >
        {content}
      </Pressable>
    )
  }

  return <View testID={testID}>{content}</View>
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },

  // ─────────────────────────────────────════════════════
  // VARIANTS — Semantic elevation and styling
  // ─────────────────────────────────────────────────────

  // Standard surface with subtle shadow
  // Used for: Fish list items, catch summaries, standard content
  default: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    ...theme.shadows.md,
  },

  // Elevated surface for emphasis
  // Used for: Featured content, important sections, highlights
  elevated: {
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.lg,
    ...theme.shadows.lg,
  },

  // Outlined variant for secondary content
  bordered: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },

  // Minimal style without background
  // Used for: Content containers, transparent overlays
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: theme.radius.lg,
  },

  // ─────────────────────────────────────────────────────
  // PADDING — 8pt grid based spacing
  // ─────────────────────────────────────────────────────

  padding_none: {},
  padding_sm: {
    padding: theme.spacing[3],
  },
  padding_md: {
    padding: theme.spacing[4],
  },
  padding_lg: {
    padding: theme.spacing[6],
  },

  // ─────────────────────────────────────────────────────
  // INTERACTIVE STATES
  // ─────────────────────────────────────────────────────

  pressed: {
    opacity: 0.8,
  },
})

export default Card
