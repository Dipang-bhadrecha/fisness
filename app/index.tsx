import React from 'react'
import {
  StyleSheet
} from 'react-native'
import { theme } from '../constants/theme'

import { Redirect } from 'expo-router'

export default function RootIndex() {
  return <Redirect href="/(auth)/phone" />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoIcon: {
    fontSize: 72,
  },
  logoName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  form: {
    gap: theme.spacing.sm,
  },
  formLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: theme.touchTarget,
  },
})