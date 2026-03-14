/**
 * Badge Component — Status Indicator
 * Compact, visually distinct status labels
 * 20px height + proper contrast ratios (WCAG AA)
 */

import { useTheme } from '@/store/themeStore'
import React, { useMemo } from 'react'
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  style?: ViewStyle
  testID?: string
}

/**
 * Compact status badge with semantic coloring
 * - default: Gray/neutral (disabled, inactive)
 * - success: Green (complete, settled)
 * - warning: Amber (pending, caution)
 * - danger: Red (error, critical)
 * - info: Teal (informational, active)
 */
export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
  testID,
}: BadgeProps) {
  const theme = useTheme()
  const styles = useMemo(() => StyleSheet.create({
    base: {
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    default: {
      backgroundColor: theme.colors.textMuted,
    },
    success: {
      backgroundColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warning,
    },
    danger: {
      backgroundColor: theme.colors.danger,
    },
    info: {
      backgroundColor: theme.colors.primary,
    },
    size_sm: { paddingHorizontal: 8, paddingVertical: 3, minHeight: 20 },
    size_md: { paddingHorizontal: 12, paddingVertical: 4, minHeight: 24 },
    label: {
      fontWeight: theme.fontWeight.semibold,
      color: '#fff',
    },
    label_sm: {
      fontSize: theme.fontSize.xs,
    },
    label_md: {
      fontSize: theme.fontSize.sm,
    },
  }), [theme])
  
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.label, styles[`label_${size}`]]}>
        {label}
      </Text>
    </View>
  )
}
