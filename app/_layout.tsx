import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar
        style="light"
        backgroundColor="transparent"
        translucent={true}
      />
      <Stack>
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