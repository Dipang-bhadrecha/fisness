import { Stack } from 'expo-router'

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a1628' },
        animation: 'slide_from_right',
      }}
    />
  )
}