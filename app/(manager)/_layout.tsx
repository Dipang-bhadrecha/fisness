import { useTheme } from '@/store/themeStore'
import { Slot } from 'expo-router'
import { View } from 'react-native'

export default function ManagerLayout() {
  const theme = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Slot />
    </View>
  )
}