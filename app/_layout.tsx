import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'

/**
 * Root Layout with Design System Integration
 * - Dark mode optimized for fisherman environment
 * - Light mode support for accessibility
 * - Professional design tokens applied globally
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar
        style="light"
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="tali"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="summary"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="bill"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}