import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { darkTheme, lightTheme } from '../constants/theme'
import { useThemeStore } from '../store/themeStore'

export default function RootLayout() {
  const { mode, isInitialised, initTheme } = useThemeStore()
  const activeTheme = mode === 'dark' ? darkTheme : lightTheme

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
            backgroundColor: activeTheme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" color={activeTheme.colors.primary} />
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={activeTheme.colors.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: activeTheme.colors.background,
          },
        }}
      >
        <Stack.Screen name="index"        options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"       options={{ headerShown: false }} />
        <Stack.Screen name="(setup)"      options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(owner)"      options={{ headerShown: false }} />
        <Stack.Screen name="(home)"       options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)"  options={{ headerShown: false }} />
        <Stack.Screen name="tali-bill"    options={{ headerShown: false }} />
        <Stack.Screen name="tali-list"    options={{ headerShown: false }} />
        <Stack.Screen name="crew"         options={{ headerShown: false }} />
        <Stack.Screen name="kharchi"      options={{ headerShown: false }} />
        <Stack.Screen name="profile"      options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="access"       options={{ headerShown: false }} />
        <Stack.Screen name="crew-detail"  options={{ headerShown: false }} />
        <Stack.Screen name="trips"        options={{ headerShown: false }} />
        <Stack.Screen name="ledger"       options={{ headerShown: false }} />
        <Stack.Screen name="add-expense"  options={{ headerShown: false }} />
        <Stack.Screen name="add-crew"     options={{ headerShown: false }} />
        <Stack.Screen name="tali-template" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  )
}