// app/(setup)/_layout.tsx
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
      <Stack.Screen name="role-select"   options={{ headerShown: false }} />
      <Stack.Screen name="quick-setup"   options={{ headerShown: false }} />
      <Stack.Screen name="invite-code"   options={{ headerShown: false }} />
      <Stack.Screen name="role"          options={{ headerShown: false }} />
      <Stack.Screen name="owner-type"    options={{ headerShown: false }} />
      <Stack.Screen name="company-setup" options={{ headerShown: false }} />
      <Stack.Screen name="manager-connect" options={{ headerShown: false }} />
      <Stack.Screen name="done"          options={{ headerShown: false }} />
    </Stack>
  )
}