/**
 * Card Component — Elevated Surface Container
 * Professional design with proper shadows and spacing
 * Supports multiple variants: default, elevated, bordered
 */

import { useTheme } from '@/store/themeStore'
import React, { useMemo } from 'react'
import {
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native'

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
  const theme = useTheme()
  const styles = useMemo(() => StyleSheet.create({
    base: {
      overflow: 'hidden',
    },
    default: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      ...theme.shadows.md,
    },
    elevated: {
      backgroundColor: theme.colors.elevated,
      borderRadius: theme.radius.lg,
      ...theme.shadows.lg,
    },
    bordered: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: theme.radius.lg,
    },
    padding_none: { padding: 0 },
    padding_sm: { padding: theme.spacing[2] },
    padding_md: { padding: theme.spacing[3] },
    padding_lg: { padding: theme.spacing[4] },
    pressed: { opacity: 0.95 },
  }), [theme])
  
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
