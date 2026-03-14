import React from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'pause' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

/**
 * Button Component — Industry-Grade Design
 * Supports multiple variants with proper contrast ratios (WCAG AA+)
 * Touch targets optimized for wet hands (64px)
 */
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
  const theme = useTheme()
  const styles = useMemo(() => StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    primary: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.md,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      ...theme.shadows.md,
    },
    pause: {
      backgroundColor: theme.colors.pause,
      ...theme.shadows.sm,
    },
    tertiary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    size_sm: {
      paddingHorizontal: theme.spacing[3],
      minHeight: 40,
    },
    size_md: {
      paddingHorizontal: theme.spacing[4],
      minHeight: theme.touchTarget,
    },
    size_lg: {
      paddingHorizontal: theme.spacing[6],
      minHeight: 56,
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      fontweight: theme.fontWeight.semibold,
      letterSpacing: 0.3,
    },
    label_primary: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
    },
    label_secondary: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
    },
    label_danger: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
    },
    label_pause: {
      color: theme.colors.pauseText,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
    },
    label_tertiary: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
    },
    label_sm: {
      fontSize: theme.fontSize.md,
    },
    label_md: {
      fontSize: theme.fontSize.lg,
    },
    label_lg: {
      fontSize: theme.fontSize.xl,
    },
  }), [theme])

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.65}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={
            variant === 'secondary' || variant === 'tertiary'
              ? theme.colors.primary
              : theme.colors.textPrimary
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`label_${variant}`],
            styles[`label_${size}`],
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

