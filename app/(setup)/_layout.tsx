/**
 * app/(setup)/_layout.tsx — Setup Group Layout (UPDATED)
 *
 * Added: role-select, quick-setup, invite-code
 * Kept: role, owner-type, company-setup, manager-connect, done
 *       (old screens stay so existing test users don't break)
 */

import { Stack } from 'expo-router'
import { theme } from '../../constants/theme'

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      {/* ── NEW screens ── */}
      <Stack.Screen name="role-select"  options={{ headerShown: false }} />
      <Stack.Screen name="quick-setup"  options={{ headerShown: false }} />
      <Stack.Screen name="invite-code"  options={{ headerShown: false }} />

      {/* ── OLD screens (keep during migration) ── */}
      <Stack.Screen name="role"           options={{ headerShown: false }} />
      <Stack.Screen name="owner-type"     options={{ headerShown: false }} />
      <Stack.Screen name="company-setup"  options={{ headerShown: false }} />
      <Stack.Screen name="manager-connect" options={{ headerShown: false }} />
      <Stack.Screen name="done"           options={{ headerShown: false }} />
    </Stack>
  )
}