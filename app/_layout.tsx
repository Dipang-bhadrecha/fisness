import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'
import { useThemeStore } from '../store/themeStore'

export default function RootLayout() {
  const { mode, isInitialised, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isInitialised) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
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
        <Stack.Screen name="index"   options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
        <Stack.Screen name="(setup)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="tali"    options={{ headerShown: false }} />
        <Stack.Screen name="summary" options={{ headerShown: false }} />
        <Stack.Screen name="bill"    options={{ headerShown: false }} />
        <Stack.Screen name="crew"    options={{ headerShown: false }} />
        <Stack.Screen name="kharchi" options={{ headerShown: false }} />
        <Stack.Screen name="profile"      options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="access"       options={{ headerShown: false }} />
        <Stack.Screen name="crew-detail" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  )
}
