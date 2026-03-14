import { useTheme } from '@/store/themeStore'
import { Stack } from 'expo-router'

export default function AuthLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    />
  )
}
