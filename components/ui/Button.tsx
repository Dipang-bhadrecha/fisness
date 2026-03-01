import React from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native'
import { theme } from '../../constants/theme'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'pause'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.textPrimary} size="small" />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.touchTarget,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  pause: {
    backgroundColor: theme.colors.pause,
  },

  // Sizes
  size_sm: { paddingHorizontal: theme.spacing.md, minHeight: 40 },
  size_md: { paddingHorizontal: theme.spacing.lg, minHeight: theme.touchTarget },
  size_lg: { paddingHorizontal: theme.spacing.xl, minHeight: 72 },

  // Disabled
  disabled: { opacity: 0.4 },

  // Labels
  label: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  label_primary: { color: theme.colors.textPrimary },
  label_secondary: { color: theme.colors.textPrimary },
  label_danger: { color: theme.colors.textPrimary },
  label_pause: { color: theme.colors.pauseText },
})