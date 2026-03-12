/**
 * app/index.tsx
 *
 * New user  → /(setup)/role-select   (new checkbox role picker)
 * Returning → /(dashboard)           (smart entity router)
 */

import { Redirect } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { theme } from '../constants/theme'
import { useAuthStore } from '../store/authStore'

export default function RootIndex() {
  const { token, hasCompletedSetup, isInitialised, restoreFromStorage } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    restoreFromStorage().then(() => setReady(true))
  }, [])

  if (!ready || !isInitialised) {
    return (
      <View style={s.splash}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  if (!token)             return <Redirect href="/(auth)/phone" />
  if (!hasCompletedSetup) return <Redirect href="/(setup)/role-select" />
  return                         <Redirect href="/(dashboard)" />
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
})