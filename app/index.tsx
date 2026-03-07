/**
 * app/index.tsx — Root entry point
 *
 * Restores the persisted auth session from AsyncStorage,
 * then routes the user to the correct screen:
 *
 *   No token            → /(auth)/phone   (login)
 *   Token + no setup    → /(setup)/role   (first time wizard)
 *   Token + setup done  → /(owner)/home   (dashboard)
 *
 * This runs on every cold start. The loading state ensures
 * no flash of the wrong screen before the decision is made.
 */

import { Redirect } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { theme } from '../constants/theme'
import { useAuthStore } from '../store/authStore'

export default function RootIndex() {
  const { token, hasCompletedSetup, isInitialised, restoreFromStorage } =
    useAuthStore()

  const [ready, setReady] = useState(false)

  useEffect(() => {
    restoreFromStorage().then(() => setReady(true))
  }, [])

  // Show nothing (or a spinner) while restoring session
  if (!ready || !isInitialised) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  // Routing decision — Redirect components never flash
  if (!token) {
    return <Redirect href="/(auth)/phone" />
  }

  if (!hasCompletedSetup) {
    return <Redirect href="/(setup)/role" />
  }

  return <Redirect href="/(owner)/home" />
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
})